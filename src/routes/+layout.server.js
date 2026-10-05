import { getSides, getSideData } from '$lib/functions/getSides';

export async function load({ cookies, locals }) {
	const sql = locals.sql;

	const sides = await getSides(sql, {
		select: ['id', 'name', 'type', 'archived', 'colorPlus']
	});
	for (let i = 0; i < sides.length; i++) {
		sides[i] = { ...sides[i], ...(await getSideData(sql, sides[i].id)) };
	}

	return {
		sides,
		player: locals.player
	};
}
