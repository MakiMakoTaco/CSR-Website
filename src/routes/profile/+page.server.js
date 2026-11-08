import { updatePlayer } from '$lib/functions/user.js';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	invalidateSession
} from '$lib/server/session.js';
import { fail, redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.session) {
		redirect(302, '/login');
	}
}

export const actions = {
	update: async ({ request, locals }) => {
		const sql = locals.sql;

		const player = locals.player;
		const playerId = player.id;
		const data = await request.formData();

		let update = false;
		let newData = {};
		for (let [key, value] of data) {
			if (key === 'nameColor') {
				const validHex = value.match(/^#?(?<hex>[0-9A-F]{6})$/i);

				if (!validHex?.groups || !validHex.groups.hex) {
					return fail(400, { error: 'Name color must be a valid hex code' });
				}

				value = validHex.groups.hex;
			} else if (key === 'name') {
				if (value.length > 50) {
					return fail(400, {
						error: 'Name exceeded character limit. Must be under 50 characters long'
					});
				}
				value = player.name;
			} else if (key === 'about' && value.length > 1000) {
				return fail(400, {
					error: 'About me exceeded character limit. Must be under 1000 characters long'
				});
			}

			if (value !== (player[key] ?? '')) {
				newData[key] = value;
				update = true;
			}
		}

		if (update) {
			try {
				await updatePlayer(sql, newData, playerId);

				for (const key of Object.keys(newData)) {
					player[key] = newData[key];
				}

				return { success: true };
			} catch (error) {
				console.error(error);
				return fail(400, { error: error.message });
			}
		}
	},

	logout: async (event) => {
		if (event.locals.session === null) {
			return fail(401);
		}

		const sql = event.locals.sql;

		await invalidateSession(sql, event.locals.session.id);
		setSessionTokenCookie(event);

		return redirect(302, '/');
	}
};
