import { getSides } from '$lib/database/functions/getSides';
import { getTiers } from '$lib/database/functions/getTiers.js';
import { getMods } from '$lib/database/functions/getMods.js';

import { error } from '@sveltejs/kit';
import sql from '$lib/database/db.js';

export async function load({ params, locals }) {
	let side = (await getSides({ name: params.name }))[0];

	const tiers = await getTiers(side.id);

	for (let i = 0; i < tiers.length; i++) {
		tiers[i].mods = [...(await getMods(tiers[i].id))];

		const modIds = tiers[i].mods.map((mod) => mod.id);

		if (locals.player) {
			tiers[i].clears = (
				await sql`
    SELECT COUNT(*)
    FROM player_progress
    JOIN mods ON player_progress.mod_id = mods.id
    WHERE player_id = ${locals.player.id}
		AND mods.id IN ${sql(modIds)}
  `
			)[0]['count'];
		}
	}

	side.tiers = [...tiers];

	if (!side) error(404);

	return { side };
}
