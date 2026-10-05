import { error } from '@sveltejs/kit';
import { getModData } from '$lib/functions/getMods.js';

export async function load({ params, locals }) {
	if (!Number(params.id)) error(404);

	const sql = locals.sql;

	const mod = await getModData(sql, params.id);
	const clears = (
		await sql`
		SELECT COUNT(*)
		FROM player_progress
		WHERE mod_id = ${mod.id}
	`
	)[0].count;

	return { mod, clears };
}
