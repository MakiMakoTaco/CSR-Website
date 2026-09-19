import { getModData } from '$lib/database/functions/getMods.js';

export async function load({ params }) {
	if (!Number(params.id)) error(404);

	const mod = await getModData(params.id); // this gets the mod with id instead of mod_data with id

	return { mod };
}
