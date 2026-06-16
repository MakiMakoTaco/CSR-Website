import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session.js';
import { fail, redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.session) {
		return redirect(302, '/login');
	}
}

export const actions = {
	default: async (event) => {
		if (event.locals.session === null) {
			return fail(401);
		}

		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);

		return redirect(302, '/');
	}
};
