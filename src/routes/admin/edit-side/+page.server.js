import { getSides } from '$lib/database/functions/getSides';

export async function load() {
	const sideNames = await getSides({ select: ['name', 'id'] });

	return { sideNames };
}
