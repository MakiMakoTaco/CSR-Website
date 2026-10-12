import { getSideByName } from '$lib/functions/getSides';

import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const sql = locals.sql;

	return {
		side: getSideByName(sql, params.name, locals.player?.id)
	};
}
