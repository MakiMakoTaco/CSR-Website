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

function rankName(tierName, sideName, appendSideName, plus = false) {
	return tierName + (plus ? '+' : '') + (appendSideName ? ` ${sideName}` : '');
}

function shoutoutMessage(playerName, hasBaseRank, newCheck, roles, ping = false) {
	let roleOutput = { clear: '', clearPlus: '' };
	if (ping) {
		roleOutput.clear = `<@&${roles.clear.id}>`;
		roleOutput.clearPlus = roles.clearPlus ? `<@&${roles.clearPlus.id}>` : 'Unknown plus role';
	} else {
		roleOutput.clear = roles.clear.name;
		roleOutput.clearPlus = roles.clearPlus ? roles.clearPlus.name : 'Unknown plus role';
	}

	if (!roleOutput.clear) throw new Error('Unexpected error, Missing base role');

	if (hasBaseRank) {
		return `**Congrats to our newest ${roleOutput.clearPlus} rank, ${playerName}!**`;
	} else {
		return `**Congrats to our newest ${newCheck.clearPlus ? `${roleOutput.clearPlus}${newCheck.clear ? ` (and ${roleOutput.clear})` : ''}` : roleOutput.clear} rank, ${playerName}!**`;
	}
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
						const urls = [];
						value
							.split(' ')
							.map((link) => link.trim())
							.forEach((url) => {
								urls.push(new URL(value).href);
							});

						value = urls.join(' ');
					} catch (error) {
						return fail(400, { modId, error: 'does not have a valid URL as proof' });
					}
				}
			} else if (dbKey === 'deaths' && value < 0) {
				return fail(400, { error: 'Deaths cannot be less than 0' });
			}

			modMap[modId] = { ...modMap[modId], [dbKey]: value || null };
		}

		const allowedTypes = ['image/webp', 'image/png', 'image/jpg'];
		for (const modId in modMap) {
			const mod = modMap[modId];
			const folderName = `${playerId}/${modId}`;

			mod.playerId = playerId;
			mod.modId = modId;
			mod.cleared = true;

			if (mod.proof) {
				await platform.env.R2.delete(folderName);
			} else {
				mod.isLocalProof = true;
				mod.images = formData.getAll(`${modId}-image`);

				if (mod.images.length > 4) {
					return fail(400, { modId, error: 'has too many images' });
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

				const sightengineData = new FormData();
				if (mod.images.length > 1) {
					mod.images.forEach((image) => {
						sightengineData.append('media[]', image);
					});
				} else {
					sightengineData.append('media', image);
				}
				sightengineData.append('models', 'nudity-2.1,people-counting,type');
				sightengineData.append('api_user', SIGHTENGINE_API_USER);
				sightengineData.append('api_secret', SIGHTENGINE_API_SECRET);

				const response = await fetch('https://api.sightengine.com/1.0/check.json', {
					method: 'POST',
					body: sightengineData
				});

				const sightengineBody = await response.json();
				if (sightengineBody.status === 'failure') {
					console.error(sightengineBody.error);
					return fail(400, {
						error: 'Sightengine error'
					});
				}
				if (mod.images.length > 1) {
					for (const imageResult of sightengineBody.data) {
						if (
							imageResult.nudity.none !== 0.99 ||
							imageResult['people-counting']['0'] !== 0.99 ||
							imageResult.type.illustration < 0.95
						) {
							return fail(422, {
								error: 'Image failed moderation checks'
							});
						}
					}
				} else if (
					sightengineBody.nudity.none !== 0.99 ||
					sightengineBody['people-counting']['0'] !== 0.99 ||
					sightengineBody.type.illustration < 0.95
				) {
					return fail(422, {
						error: 'Image failed moderation checks'
					});
				}

				const uploads = mod.images.map(async (image, index) => {
					let bytes;

					if (image.type !== 'image/webp') {
						const transformed = (
							await platform.env.IMAGES.input(image.stream()).output({ format: 'image/webp' })
						).response();

						bytes = await transformed.arrayBuffer();
					} else {
						bytes = await image.arrayBuffer();
					}

					await platform.env.R2.delete(folderName);
					const fileName = `${folderName}/${index + 1}.webp`;
					await platform.env.R2.put(fileName, bytes, {
						httpMetadata: { contentType: 'image/webp' }
					});
				});

				await Promise.all(uploads);
			}

			delete mod.images;

			mods.push(mod);
		}

		await sql`
			INSERT INTO
				player_progress
			${sql(mods)}
			ON CONFLICT (player_id, mod_id)
			DO UPDATE
			SET
				proof = EXCLUDED.proof,
				is_local_proof = EXCLUDED.is_local_proof,
				updated_at = CURRENT_TIMESTAMP
		`;

		const modIds = Object.keys(modMap);
		const clearData = await sql`
			SELECT
				s.id,
				s.name,
				s.shoutout_on_clear,
				s.clears_for_rank,
				COALESCE(pr.clear, false) AS rank,
				COALESCE(pr.clear_plus, false) AS rank_plus,
				COUNT(m.id)::int AS mod_count,
				COUNT(pp.id)::int AS clears,
				json_agg(
					DISTINCT jsonb_build_object(
						'id', t.id,
						'name', tp.name,
						'append_side_name', tp.append_side_name,
						'clears_for_rank', t.clears_for_rank,
						'mod_count', tier_clears.mod_count,
						'clears', tier_clears.clears,
						'rank', tier_clears.clear,
						'rank_plus', tier_clears.clear_plus
					)
				) tiers
			FROM sides s
			LEFT JOIN tiers t
				ON t.side_id = s.id
			LEFT JOIN tier_presets tp
				ON tp.id = t.preset_id
			LEFT JOIN mods m
				ON m.tier_id = t.id
			LEFT JOIN player_progress pp
				ON pp.mod_id = m.id
				AND pp.player_id = ${playerId}
			LEFT JOIN player_roles pr
				ON pr.rank_id[1] = s.id
				AND pr.player_id = ${playerId}
			LEFT JOIN (
				SELECT
					m.tier_id,
					COUNT(m.id)::int AS mod_count,
					COALESCE(pr.clear, false) AS clear,
					COALESCE(pr.clear_plus, false) AS clear_plus,
					COUNT(p.id)::int AS clears
				FROM mods m
				LEFT JOIN player_roles pr
					ON pr.player_id = ${playerId}
					AND pr.rank_id[2] = m.tier_id
				LEFT JOIN player_progress p
					ON p.mod_id = m.id
					AND p.player_id = ${playerId}
				GROUP BY m.tier_id, pr.clear, pr.clear_plus
			) tier_clears
				ON tier_clears.tier_id = t.id
			WHERE s.id IN (
				SELECT
					side_id
				FROM tiers t
				WHERE t.id IN (
					SELECT
						tier_id
					FROM mods m
					WHERE m.id IN ${sql(modIds)}
				)
			)
			GROUP BY s.id, s.name, s.clears_for_rank, rank, rank_plus
		`;

		const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);
		const guildRoles = await rest.get(Routes.guildRoles(env.DISCORD_SERVER_ID));

		const updatedRanks = [];

		for await (const side of clearData) {
			if (side.rankPlus) continue;

			for await (const tier of side.tiers) {
				if (!tier.clearsForRank || tier.clearsForRank <= 0 || tier.rankPlus) continue;

				const shoutoutCheck = {
					clear: tier.clears >= tier.clearsForRank,
					clearPlus: tier.clears >= tier.modCount
				};

				if (shoutoutCheck.clearPlus || (!tier.rank && shoutoutCheck.clear)) {
					updatedRanks.push({
						playerId,
						rankId: `{0, ${tier.id}}`,
						clear: shoutoutCheck.clear,
						clearPlus: shoutoutCheck.clearPlus
					});
				}

				if (!shoutoutCheck.clear || (!shoutoutCheck.clearPlus && shoutoutCheck.clear && tier.rank))
					continue;

				let roles = { clear: null, clearPlus: null };
				guildRoles.forEach((role) => {
					if (role.name === rankName(tier.name, side.name, tier.appendSideName, false)) {
						roles.clear = role;
					} else if (role.name === rankName(tier.name, side.name, tier.appendSideName, true)) {
						roles.clearPlus = role;
					}
				});

				if (!roles.clear || !roles.clearPlus) {
					// return {
					// 	success: false,
					// 	error: `Error finding roles in CSR server. Please screenshot this message and send to a mod to allow them to do it on the site's behalf. Player ${locals.player.name} requires shoutouts for ${rankName(tier.name, side.name, tier.appendSideName, false)}${shoutoutCheck.clearPlus ? ` ${rankName(tier.name, side.name, tier.appendSideName, true)}` : ''}`
					// };
					continue;
				}

				try {
					let content = '';
					try {
						content = shoutoutMessage(locals.player.name, tier.rank, shoutoutCheck, roles, false);
					} catch (error) {
						console.error(error);
						// return {
						// 	success: true,
						// 	error: 'Unable to find suitable roles for shoutout(s): ' + side.name
						// };
						continue;
					}
					const post = await rest.post(Routes.channelMessages(env.DISCORD_SHOUTOUT_CHANNEL_ID), {
						body: {
							content
						}
					});

					content = shoutoutMessage(locals.player.name, tier.rank, shoutoutCheck, roles, true);

					await rest.patch(Routes.channelMessage(env.DISCORD_SHOUTOUT_CHANNEL_ID, post.id), {
						body: {
							content
						}
					});

					if (shoutoutCheck.clearPlus) {
						for (const role in roles) {
							try {
								await rest.put(
									Routes.guildMemberRole(
										env.DISCORD_SERVER_ID,
										locals.player.discordId,
										roles[role].id
									)
								);
							} catch (error) {
								console.error(error);
							}
						}
					} else {
						try {
							await rest.put(
								Routes.guildMemberRole(
									env.DISCORD_SERVER_ID,
									locals.player.discordId,
									roles.clear.id
								)
							);
						} catch (error) {
							console.error(error);
						}
					}
				} catch (error) {
					console.error(error);
				}
			}

			if (side.clearsForRank) {
				const shoutoutCheck = {
					clear: side.clears >= side.clearsForRank,
					clearPlus: side.clears >= side.modCount
				};

				if (shoutoutCheck.clearPlus || (!side.rank && shoutoutCheck.clear)) {
					updatedRanks.push({
						playerId,
						rankId: `{${side.id}, 0}`,
						clear: shoutoutCheck.clear,
						clearPlus: shoutoutCheck.clearPlus
					});
				}

				if (!shoutoutCheck.clear || (!shoutoutCheck.clearPlus && shoutoutCheck.clear && side.rank))
					continue;

				let roles = { clear: null, clearPlus: null };
				guildRoles.forEach((role) => {
					if (role.name === rankName(side.name, '', false, false)) {
						roles.clear = role;
					} else if (role.name === rankName(side.name, '', false, true)) {
						roles.clearPlus = role;
					}
				});

				if (!roles.clear || !roles.clearPlus) {
					// return {
					// 	success: true,
					// 	error: `Error finding roles in CSR server, please contact a mod to do them manually'
					// };
					continue;
				}

				try {
					let content = '';
					try {
						content = shoutoutMessage(locals.player.name, side.rank, shoutoutCheck, roles, false);
					} catch (error) {
						console.error(error);
						// return {
						// 	success: true,
						// 	error: 'Unable to find suitable roles for shoutout(s): ' + side.name + ', please contact a mod to do them manually'
						// };
						continue;
					}
					const post = await rest.post(Routes.channelMessages(env.DISCORD_SHOUTOUT_CHANNEL_ID), {
						body: {
							content
						}
					});

					content = shoutoutMessage(locals.player.name, tier.rank, shoutoutCheck, roles, true);

					await rest.patch(Routes.channelMessage(env.DISCORD_SHOUTOUT_CHANNEL_ID, post.id), {
						body: {
							content
						}
					});

					if (shoutoutCheck.clearPlus) {
						for (const role in roles) {
							try {
								await rest.put(
									Routes.guildMemberRole(
										env.DISCORD_SERVER_ID,
										locals.player.discordId,
										roles[role].id
									)
								);
							} catch (error) {
								console.error(error);
							}
						}
					} else {
						try {
							await rest.put(
								Routes.guildMemberRole(
									env.DISCORD_SERVER_ID,
									locals.player.discordId,
									roles.clear.id
								)
							);
						} catch (error) {
							console.error(error);
						}
					}
				} catch (error) {
					console.error(error);
				}
			} else if (side.shoutoutOnClear && side.clears >= side.modCount) {
				updatedRanks.push({
					playerId,
					rankId: `{${side.id}, 0}`,
					clear: true,
					clearPlus: true
				});

				let addedRole = true;
				const frogRole = guildRoles.find((role) => role.name === `The Frog ${side.name}`);

				if (frogRole) {
					try {
						await rest.put(
							Routes.guildMemberRole(env.DISCORD_SERVER_ID, locals.player.discordId, frogRole.id)
						);
					} catch (error) {
						addedRole = false;
						console.error(error);
					}
				}

				await rest.post(Routes.channelMessages(env.DISCORD_MOD_CHANNEL_ID), {
					body: {
						content: `${locals.player.name} has cleared all mods in ${side.name} and needs a shoutout${!addedRole ? '. Failed to add role automatically' : ''}`
					}
				});
			}
		}

		if (updatedRanks && updatedRanks.length > 0) {
			await sql`
				INSERT INTO
					player_roles
				${sql(updatedRanks)}
				ON CONFLICT (player_id, rank_id)
				DO UPDATE
				SET
					clear = EXCLUDED.clear,
					clear_plus = EXCLUDED.clear_plus
			`;
		}

		return { success: true };
	}
};
