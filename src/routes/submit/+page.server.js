import sql from '$lib/database/db.js';
import { getSides } from '$lib/database/functions/getSides.js';
import { getTiers } from '$lib/database/functions/getTiers.js';
import { getModNames, getMods } from '$lib/database/functions/getMods.js';

import { writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { fail } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';

export async function load() {
	let sides = await getSides();
	const mods = [];

	const modNames = await getModNames();

	for (let i = 0; i < sides.length; i++) {
		const tiers = await getTiers(sides[i].id);

		for (let j = 0; j < tiers.length; j++) {
			tiers[j].mods = [...(await getMods(tiers[j].id))];

			mods.push(
				...tiers[j].mods.map((mod) => {
					return {
						id: mod.id,
						name: mod.name,
						fullName: `${mod.name} - ${tiers[j].name} ${sides[i].name}`,
						shorthand: modNames.find((modData) => modData.id === mod.mod_data_id),
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

export const actions = {
	default: async ({ request, url, locals }) => {
		console.log(true);
		return;

		const data = await request.formData();
		const playerId = locals.player.id;

		const modMap = {};
		for (const [key, value] of data) {
			const modData = key.split('-');
			const modId = modData[0];
			let column = modData[1];

			switch (column) {
				case 'time':
					column = 'time_taken';
					break;
				case 'date':
					column = 'cleared_date';
					break;
				case 'notes':
					column = 'public_notes';
					break;
			}

			modMap[modId] = { ...modMap[modId], [column]: value || null };
		}

		// const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

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

			const existingSubmission = (
				await sql`
				select exists(
					select 1
					from player_progress
					where player_id = ${playerId} and mod_id = ${modId}
				)    
				`
			)[0];

			try {
				if (existingSubmission.exists) {
					mod.updated_at = new Date();

					await sql`
						UPDATE player_progress
						SET ${sql(mod)}
						WHERE player_id = ${playerId} AND mod_id = ${modId}
					`;
				} else if (existingSubmission.exists === false) {
					mod.player_id = playerId;
					mod.mod_id = Number(modId);
					mod.submitted_at = new Date();

					await sql`
						INSERT INTO	player_progress
						${sql(mod)}
					`;
				} else {
					throw new Error('Unable to submit mods for unknown reason');
				}
			} catch (error) {
				console.error(error);
				throw new Error(error.message);
			}
		}

		return { success: true };
	}
};
