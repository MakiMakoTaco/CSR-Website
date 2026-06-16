import { getSides } from '$lib/database/functions/getSides';
import { getTiers } from '$lib/database/functions/getTiers.js';
import { getMods } from '$lib/database/functions/getMods.js';

import { error } from '@sveltejs/kit';

export async function load({ params }) {
	let side = (await getSides({ name: params.name }))[0];

	const tiers = await getTiers(side.id);

	for (let i = 0; i < tiers.length; i++) {
		tiers[i].mods = [...(await getMods(tiers[i].id))];
	}

	side.tiers = [...tiers];

	if (!side) error(404);

	return { side };
}
