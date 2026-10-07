import { getSides } from '$lib/functions/getSides.js';
import { getTiers } from '$lib/functions/getTiers.js';
import { getModData, getModNames, getMods } from '$lib/functions/getMods.js';

import { fail, redirect } from '@sveltejs/kit';
import { DISCORD_BOT_TOKEN } from '$env/static/private';
import { env } from '$env/dynamic/private';

import { REST } from '@discordjs/rest';
import { MessageFlags, Routes } from 'discord-api-types/v10';

export async function load({ locals }) {
	if (locals.session === null) {
		redirect(302, '/login');
	}

	const sql = locals.sql;

	let sides = await getSides(sql);
	const mods = [];

	const modNames = await getModNames(sql);

	for (let i = 0; i < sides.length; i++) {
		const tiers = await getTiers(sql, sides[i].id);

		for (let j = 0; j < tiers.length; j++) {
			tiers[j].mods = [...(await getMods(sql, tiers[j].id))];

			mods.push(
				...tiers[j].mods.map((mod) => {
					return {
						id: mod.id,
						name: mod.name,
						fullName: `${mod.name} - ${tiers[j].name} ${sides[i].name}`,
						shorthand: modNames.find((modData) => modData.id === mod.modDataId),
						color: tiers[j].color,
						hidden: false
					};
				})
			);
		}

		sides[i].tiers = [...tiers];
	}

	mods.sort((a, b) => {
		const nameA = a.name.toLowerCase();
		const nameB = b.name.toLowerCase();

		if (nameA < nameB) {
			return -1;
		}

		if (nameA > nameB) {
			return 1;
		}

		return 0;
	});

	return { sides: [...sides], mods };
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

export const actions = {
	default: async ({ request, url, locals }) => {
		const sql = locals.sql;

		const data = await request.formData();
		const playerId = locals.player.id;

		const modMap = {};
		for (let [key, value] of data) {
			const modData = key.split('-');
			const modId = modData[0];
			let column = modData[1];

			if (column === 'proof') {
				try {
					const url = new URL(value);

					value = url.href;
				} catch (error) {
					const mod = await getModData(sql, modId);

					return fail(406, { error: `${mod.name} does not have a valid URL as proof` });
				}
			}

			modMap[modId] = { ...modMap[modId], [column]: value || null };
		}

		// const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

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
				EXISTS (
					SELECT 1
					FROM mods m2
					WHERE m2.tier_id = t.id
						AND m2.id IN ${sql(modIds)}
				)
			GROUP BY t.id, clears_for_rank
		`;

		for (const modId in modMap) {
			let mod = modMap[modId];
			mod.cleared = true;

			// if (!allowedTypes.includes(mod.upload.type) && !mod.link) {
			// 	return fail(422, {
			// 		error: 'Either a link or file upload is required for proof'
			// 	});
			// } else if (allowedTypes.includes(mod.upload.type) && mod.link) {
			// 	return fail(422, {
			// 		error:
			// 			'Unable to process form data with both link and upload fields filled, please only include one type of <a href="/" target="_blank">proof</a>'
			// 	});
			// }

			// mod.proof = mod.link ? mod.link : mod.upload;
			// delete mod.link;
			// delete mod.upload;

			// if (mod.proof?.size <= 0) {
			// 	return fail(422, {
			// 		error: 'Unknown error reading image with file size equal to or less than 0'
			// 	});
			// } else if (mod.proof?.size > 0) {
			// 	const fileName = randomUUID();

			// 	if (!(await existsSync(`/var/www/html/uploads/players/${playerId}`))) {
			// 		await mkdirSync(`/var/www/html/uploads/players/${playerId}`, { recursive: true });
			// 	}

			// 	await writeFileSync(
			// 		`/var/www/html/uploads/players/${playerId}/${fileName}`,
			// 		Buffer.from(await mod.proof.arrayBuffer())
			// 	);

			// 	mod.proof = `/players/${playerId}/${modId}/${fileName}`;
			// }

			// 	const existingSubmission = (
			// 		await sql`
			// 		SELECT EXISTS (
			// 			SELECT 1
			// 			FROM player_progress
			// 			WHERE
			// 				player_id = ${playerId}
			// 				AND mod_id = ${modId}
			// 		)
			// 		`
			// 	)[0];

			// 	try {
			// 		if (existingSubmission.exists) {
			// 			mod.updatedAt = new Date();

			// 			await sql`
			// 				UPDATE player_progress
			// 				SET ${sql(mod)}
			// 				WHERE
			// 					player_id = ${playerId}
			// 					AND mod_id = ${modId}
			// 			`;
			// 		} else if (existingSubmission.exists === false) {
			// 			mod.playerId = playerId;
			// 			mod.modId = Number(modId);
			// 			mod.submittedAt = new Date();

			// 			await sql`
			// 				INSERT INTO	player_progress
			// 				${sql(mod)}
			// 			`;
			// 		} else {
			// 			throw new Error('Unable to submit mods for unknown reason');
			// 		}
			// 	} catch (error) {
			// 		console.error(error);
			// 		throw new Error(error.message);
			// 	}
		}

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
