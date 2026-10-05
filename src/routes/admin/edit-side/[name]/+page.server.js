import { getSides } from '$lib/functions/getSides';
import { getTiers } from '$lib/functions/getTiers.js';
import { getModData, getMods } from '$lib/functions/getMods.js';

import { error } from '@sveltejs/kit';

async function getData(locals, id) {
	const sql = locals.sql;

	const tiers = await getTiers(sql, id);

	for (let i = 0; i < tiers.length; i++) {
		const mods = [...(await getMods(sql, tiers[i].id))];
		tiers[i].mods = mods.map((mod) => ({ data: getModData(sql, mod.id) }));
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
