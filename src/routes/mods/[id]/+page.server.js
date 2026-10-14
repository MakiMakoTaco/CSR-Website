import { getMinModData } from '$lib/functions/getMods.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	if (!Number(params.id)) error(404, "Mod doesn't exist");

	const sql = locals.sql;
	const mod = await getMinModData(sql, params.id);

	if (!mod) error(404, "Mod doesn't exist");

	return { mod };
}
