import { updatePlayer } from '$lib/database/functions/user.js';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session.js';
import { fail, redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.session) {
		return redirect(302, '/login');
	}
}

export const actions = {
	update: async ({ request, locals }) => {
		const player = locals.player;
		const playerId = player.id;
		const data = await request.formData();

		let update = false;
		let newData = {};
		for (let [key, value] of data) {
			let updateKey = key;

			if (key === 'nameColor') {
				value = value.slice(1);
				updateKey = 'name_color';
			}

			if (value !== (player[key] ?? '')) {
				newData[updateKey] = value;
				update = true;
			}
		}

		if (update) {
			try {
				await updatePlayer(newData, playerId);

				for (const updateKey of Object.keys(newData)) {
					let key = updateKey;
					if (updateKey === 'name_color') key = 'nameColor';

					player[key] = newData[updateKey];
				}

				return { success: true };
			} catch (error) {
				console.error(error);
				return { error: true, message: error.message };
			}
		}
	},

	logout: async (event) => {
		if (event.locals.session === null) {
			return fail(401);
		}

		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);

		return redirect(302, '/');
	}
};
