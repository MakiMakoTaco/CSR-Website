import { getSideData, getSides } from '$lib/database/functions/getSides';

export async function load({ locals }) {
	const sides = await getSides();
	for (let i = 0; i < sides.length; i++) {
		sides[i] = { ...sides[i], ...(await getSideData(sides[i].id)) };
	}

	return { sides };
}
