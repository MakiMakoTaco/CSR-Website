import { getSides } from '$lib/functions/getSides';
import { getTiers } from '$lib/functions/getTiers.js';
import { getMods } from '$lib/functions/getMods.js';

import { error } from '@sveltejs/kit';

async function getData(locals, id) {
	const sql = locals.sql;

	const tiers = await getTiers(sql, id);

	for (let i = 0; i < tiers.length; i++) {
		tiers[i].mods = [...(await getMods(sql, tiers[i].id))];
		const modIds = tiers[i].mods.map((mod) => mod.id);
		if (locals.player) {
			tiers[i].clears = [
				...(
					await sql`
						SELECT mod_id
						FROM player_progress pp
						JOIN mods m
							ON pp.mod_id = m.id
						WHERE
							player_id = ${locals.player.id}
							AND pp.cleared = true
							AND m.id IN ${sql(modIds)}
					`
				).map((clear) => clear.modId)
			];
		}
	}

	return tiers;
}

export async function load({ params, locals }) {
	const sql = locals.sql;

	const side = (await getSides(sql, { name: params.name }))[0];

	return {
		side: { ...side, tiers: getData(locals, side.id) }
	};
}
