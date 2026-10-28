import { env } from '$env/dynamic/private';
import {
	DISCORD_BOT_TOKEN,
	SIGHTENGINE_API_USER,
	SIGHTENGINE_API_SECRET
} from '$env/static/private';
import { error, fail, redirect } from '@sveltejs/kit';

import { getSideByName, getSubmitData } from '$lib/functions/getSides.js';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

async function getData(sql, parent, playerId) {
	const parentSides = (await parent()).sides;
	const sides = [];
	parentSides.forEach((side) => {
		if (side.archived === true) return;

		sides.push(getSubmitData(sql, side.name, playerId));
	});

	return sides;
}

function checkClearRequirements(requirements) {
	return {
		clear: requirements.clearedMods >= requirements.clearsForRank,
		clearPlus: requirements.clearedMods >= requirements.modCount
	};
}

function rankName(rank, plus = false) {
	return rank.tierName + (plus ? '+' : '') + (rank.appendSideName ? ` ${rank.sideName}` : '');
}

export async function load({ locals, parent }) {
	if (locals.session === null) {
		redirect(302, '/login');
	}

	return { sides: getData(locals.sql, parent, locals.player.id) };
}

export const actions = {
	default: async ({ request, url, locals, platform }) => {
		const sql = locals.sql;

		const formData = await request.formData();
		const playerId = locals.player.id;

		const mods = [];
		const modMap = {};
		for (let [key, value] of formData) {
			const [modId, dbKey] = key.split('-');

			if (dbKey === 'image') continue;

			if (dbKey === 'proof') {
				if (value) {
					try {
						const url = new URL(value);

						value = url.href;
					} catch (error) {
						return fail(400, { error: `${modId} does not have a valid URL as proof` });
					}
				}
			}

			modMap[modId] = { ...modMap[modId], [dbKey]: value || null };
		}

		const allowedTypes = ['image/webp', 'image/png', 'image/jpg'];
		for (const modId in modMap) {
			const mod = modMap[modId];

			mod.playerId = playerId;
			mod.modId = modId;
			mod.cleared = true;

			if (!mod.proof) {
				mod.isLocalProof = true;
				mod.images = formData.getAll(`${modId}-image`);

				if (mod.images.length > 4) {
					return fail(400, { error: `${modId} has too many images` });
				}

				for (const image of mod.images) {
					if (image.size === 0) {
						return fail(400, { error: `${modId} has no valid proof` });
					}

					if (!allowedTypes.includes(image.type)) {
						return fail(400, {
							error: 'File must be of type WebP (under 130KB) or PNG/JPEG (under 4MB)'
						});
					}

					if (image.size > 1000 * 1000 * 4) {
						return fail(400, {
							error: 'File must be smaller than 4MB'
						});
					}

					if (image.type === 'image/webp' && image.size > 1000 * 130) {
						return fail(400, {
							error: 'WebP files must be smaller than 130KB'
						});
					}
				}

				// const sightengineData = new FormData();
				// mod.images.forEach((image) => {
				// 	sightengineData.append('media[]', image);
				// });
				// sightengineData.append('models', 'nudity-2.1,people-counting,type');
				// sightengineData.append('api_user', SIGHTENGINE_API_USER);
				// sightengineData.append('api_secret', SIGHTENGINE_API_SECRET);

				// const response = await fetch('https://api.sightengine.com/1.0/check.json', {
				// 	method: 'POST',
				// 	body: sightengineData
				// });

				// const sightengineBody = await response.json();
				// console.log(sightengineBody);
				// if (sightengineBody.status === 'failure') {
				// 	console.error(sightengineBody.error);
				// 	return fail(400, {
				// 		error: 'Sightengine error'
				// 	});
				// }
				// if (mod.images.length > 1) {
				// 	for (const imageResult of sightengineBody.data) {
				// 		if (
				// 			imageResult.nudity.none !== 0.99 ||
				// 			imageResult['people-counting']['0'] !== 0.99 ||
				// 			imageResult.type.illustration < 0.95
				// 		) {
				// 			return fail(422, {
				// 				error: 'Image failed moderation checks'
				// 			});
				// 		}
				// 	}
				// } else if (
				// 	sightengineBody.nudity.none !== 0.99 ||
				// 	sightengineBody['people-counting']['0'] !== 0.99 ||
				// 	sightengineBody.type.illustration < 0.95
				// ) {
				// 	return fail(422, {
				// 		error: 'Image failed moderation checks'
				// 	});
				// }

				// const uploads = mod.images.map(async (image, index) => {
				// 	let bytes;

				// 	if (image.type !== 'image/webp') {
				// 		const transformed = (
				// 			await platform.env.IMAGES.input(image.stream()).output({ format: 'image/webp' })
				// 		).response();

				// 		bytes = await transformed.arrayBuffer();
				// 	} else {
				// 		bytes = await image.arrayBuffer();
				// 	}

				// 	const folderName = `${playerId}/${modId}`;
				// 	await platform.env.R2.delete(folderName);
				// 	const fileName = `${folderName}/${index + 1}`;
				// 	await platform.env.R2.put(fileName, bytes, {
				// 		httpMetadata: { contentType: 'image/webp' }
				// 	});
				// });

				// await Promise.all(uploads);
			}

			delete mod.images;

			mods.push(mod);
		}

		// await sql`
		// 	INSERT INTO
		// 		player_progress
		// 	${sql(mods)}
		// 	ON CONFLICT (player_id, mod_id)
		// 	DO UPDATE
		// 	SET
		// 		proof = EXCLUDED.proof,
		// 		is_local_proof = EXCLUDED.is_local_proof,
		// 		updated_at = CURRENT_TIMESTAMP
		// `;

		const modIds = Object.keys(modMap);
		const tiers = await sql`
			SELECT
				t.id,
				clears_for_rank,
				COUNT(m.id)::int AS mod_count,
				COUNT(pp.player_id)::int AS cleared_mods
			FROM tiers t
			LEFT JOIN mods m
				ON m.tier_id = t.id
			LEFT JOIN player_progress pp
				ON pp.mod_id = m.id
				AND pp.player_id = ${playerId}
			WHERE
				t.clears_for_rank <> 0
				AND EXISTS (
					SELECT 1
					FROM mods m2
					WHERE m2.tier_id = t.id
						AND m2.id IN ${sql(modIds)}
				)
			GROUP BY t.id, clears_for_rank
		`;

		const playerRoles = await sql`
			SELECT
				array_to_json(rank_id) AS rank_id,
				clear,
				clear_plus
			FROM player_roles
			WHERE
				player_id = ${playerId}
				AND rank_id[2] IN ${sql(tiers.map((tier) => tier.id))}
		`;

		console.log(tiers, playerRoles);
		return;

		tiers.forEach(async (tier) => {
			const existingRank = playerRoles.find((role) => role.rankId[1] == tier.id) ?? {
				rankId: [0, tier.id],
				clear: false,
				clearPlus: false
			};

			if (existingRank.clearPlus) return;

			const shoutoutCheck = checkClearRequirements(tier);
			if (!shoutoutCheck.clear) return;

			const rankData = (
				await sql`
				SELECT
					s.name AS side_name,
					tp.name AS tier_name,
					append_side_name
				FROM tiers t
				JOIN sides s
					ON s.id = t.side_id
				JOIN tier_presets tp
					ON tp.id = t.preset_id
				WHERE t.id = ${tier.id}
			`
			)[0];

			const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

			let roles = { clear: null, clearPlus: null };
			const guildRoles = await rest.get(Routes.guildRoles(env.DISCORD_SERVER_ID));

			guildRoles.forEach((role) => {
				if (role.name === rankName(rankData, false)) {
					roles.clear = role;
				} else if (role.name === rankName(rankData, true)) {
					roles.clearPlus = role;
				}
			});

			try {
				let content = `**Congrats to our newest ${shoutoutCheck.clearPlus ? `${roles.clearPlus.name}${shoutoutCheck.clear ? roles.clear.name : ''}` : roles.clear.name} rank, ${locals.player.name}!**`;
				const post = await rest.post(Routes.channelMessages(env.DISCORD_SHOUTOUT_CHANNEL_ID), {
					body: {
						content
					}
				});

				content = `**Congrats to our newest ${shoutoutCheck.clearPlus ? `<@&${roles.clearPlus.id}>${shoutoutCheck.clear ? ` (and <@&${roles.clear.id}>)` : ''}` : `<@&${roles.clear.id}>`} rank, ${locals.player.name}!**`;
				await rest.patch(Routes.channelMessage(env.DISCORD_SHOUTOUT_CHANNEL_ID, post.id), {
					body: {
						content
					}
				});

				// for (const role in roles) {
				// 	try {
				// 		await rest.put(
				// 			Routes.guildMemberRole(env.DISCORD_SERVER_ID, locals.player.discordId, roles[role].id)
				// 		);
				// 	} catch (error) {
				// 		console.error(error);
				// 	}
				// }
			} catch (error) {
				console.error(error);
			}
		});

		return { success: true };
	}
};
