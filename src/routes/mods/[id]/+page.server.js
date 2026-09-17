import sql from '$lib/database/db.js';
import { error } from '@sveltejs/kit';
import { getModData } from '$lib/database/functions/getMods.js';

export async function load({ params }) {
	if (!Number(params.id)) error(404);

	const mod = await getModData(params.id);
	const clears = (
		await sql`
		SELECT COUNT(*)
		FROM player_progress
		WHERE mod_id = ${mod.id}
	`
	)[0].count;

	return { mod, clears };
}
