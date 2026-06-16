import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	const player = locals.player;

	if (!player || !player?.role) {
		redirect(302, '/');
	}
}
