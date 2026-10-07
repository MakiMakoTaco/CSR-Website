import { getSidesWithStats } from '$lib/functions/getSides';

export async function load({ locals }) {
	const sides = await getSidesWithStats(locals.sql);

	return {
		sides,
		player: locals.player
	};
}
