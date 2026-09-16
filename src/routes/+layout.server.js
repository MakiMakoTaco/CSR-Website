import { getSides } from '$lib/database/functions/getSides';

export async function load({ cookies, locals }) {
	return {
		sides: await getSides({
			select: ['name', 'type', 'archived', 'color_plus']
		}),
		player: locals.player
	};
}
