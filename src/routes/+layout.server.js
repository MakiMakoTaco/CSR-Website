import { getSides, getSideData } from '$lib/database/functions/getSides';

export async function load({ cookies, locals }) {
	const sides = await getSides({
		select: ['id', 'name', 'type', 'archived', 'color_plus']
	});
	for (let i = 0; i < sides.length; i++) {
		sides[i] = { ...sides[i], ...(await getSideData(sides[i].id)) };
	}

	return {
		sides,
		player: locals.player
	};
}
