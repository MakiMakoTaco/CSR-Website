import { getSides } from '$lib/functions/getSides';

export async function load({ locals }) {
	const sql = locals.sql;
	const sideNames = (await getSides(sql, { select: 'name' })).map((side) => side.name);

	return { sideNames };
}
