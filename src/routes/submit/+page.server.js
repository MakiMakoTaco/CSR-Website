import sql from '$lib/database/db.js';
import { getSides } from '$lib/database/functions/getSides.js';
import { getTiers } from '$lib/database/functions/getTiers.js';
import { getMods } from '$lib/database/functions/getMods.js';

import { writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { fail } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';

export async function load() {
	let sides = await getSides();
	const mods = [];

	for (let i = 0; i < sides.length; i++) {
		const tiers = await getTiers(sides[i].id);

		for (let j = 0; j < tiers.length; j++) {
			tiers[j].mods = [...(await getMods(tiers[j].id))];

			mods.push(
				...tiers[j].mods.map((mod) => {
					return { id: mod.id, name: mod.name };
				})
			);
		}

		sides[i].tiers = [...tiers];
	}

	return { sides: [...sides], mods };
}

export const actions = {
	default: async ({ request, url, locals }) => {
		const data = await request.formData();
		const playerId = locals.player.id;

		const modMap = {};
		for (const [key, value] of data) {
			const modId = key.split('-');
			modMap[modId[0]] = { ...modMap[modId[0]], [modId[1]]: value ?? null };
		}

		const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

		for (const modId in modMap) {
			const mod = modMap[modId];

			if (!allowedTypes.includes(mod.upload.type) && !mod.link) {
				return fail(422, {
					error: 'Either a link or file upload is required for proof'
				});
			} else if (allowedTypes.includes(mod.upload.type) && mod.link) {
				return fail(422, {
					error:
						'Unable to process form data with both link and upload fields filled, please only include one type of <a href="/" target="_blank">proof</a>'
				});
			}

			mod.proof = mod.link ? mod.link : mod.upload;
			delete mod.link;
			delete mod.upload;

			if (mod.proof?.size <= 0) {
				return fail(422, {
					error: 'Unknown error reading image with file size equal to or less than 0'
				});
			} else if (mod.proof?.size > 0) {
				const fileName = randomUUID();

				if (!(await existsSync(`/var/www/html/uploads/players/${playerId}`))) {
					await mkdirSync(`/var/www/html/uploads/players/${playerId}`, { recursive: true });
				}

				await writeFileSync(
					`/var/www/html/uploads/players/${playerId}/${fileName}`,
					Buffer.from(await mod.proof.arrayBuffer())
				);

				mod.proof = `/players/${playerId}/${modId}/${fileName}`;
			}

			await sql`
				INSERT INTO	player_progress
					(player_id, mod_id, cleared, proof, time_taken, deaths, is_fc, cleared_date, is_private, private_notes, public_notes, mod_notes)
				VALUES ${sql([playerId, modId, true, mod.proof, mod.time || null, mod.deaths || null, mod?.fc ? true : false, mod.date || null, mod?.private ? true : false, mod.privateNotes, mod.publicNotes, mod.modNotes])}
			`;
		}

		return { success: true };
	}
};
