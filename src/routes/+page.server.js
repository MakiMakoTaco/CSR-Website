import { getSideData, getSides } from '$lib/functions/getSides';

export async function load({ locals }) {
	const sql = locals.sql;

	const sides = await getSides(sql, {
		select: ['id', 'name', 'type', 'archived', 'colorPlus']
	});

	return {
		sides: sides.map((side) => ({
			...side,
			data: getSideData(sql, side.id)
		}))
	};
}
