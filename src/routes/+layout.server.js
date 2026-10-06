import { getSidesWithStats } from '$lib/functions/getSides';

export async function load({ locals }) {
	const sql = locals.sql;

	const sides = await getSidesWithStats(sql);

	return {
		sides,
		player: locals.player
	};
}
