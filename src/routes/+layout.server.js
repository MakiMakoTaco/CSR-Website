import { getSides } from '$lib/database/functions/getSides';

export async function load({ cookies, locals }) {
	return {
		sides: await getSides({ select: ['name', 'type'] }),
		player: locals.player
	};
}
