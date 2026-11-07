import { createSession } from '$lib/server/session';
import { setSessionTokenCookie } from '$lib/server/session';
import { generateSessionToken } from '$lib/server/session';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (locals.session === null) {
		redirect(302, '/');
	}

	if (locals.player.claimed) {
		redirect(302, '/profile');
	}

	const sql = locals.sql;

	const playerList = await sql`
    SELECT *
    FROM players
    WHERE
			discord_id IS NULL
			AND claimed = false
		ORDER BY id ASC
  `;

	return { playerList };
}

export const actions = {
	claim: async (event) => {
		const locals = event.locals;
		const sql = locals.sql;

		if (locals.session === null) {
			return fail(401);
		}

		const playerId = locals.player.id;
		const selectedPlayerId = (await event.request.formData()).get('selected_player_id');

		const playerClaim = { currentPlayerId: playerId, requestedPlayerId: selectedPlayerId };

		await sql`
			INSERT INTO
				player_claims
			${sql(playerClaim)}
		`;

		return { success: true, requestedPlayer: selectedPlayerId };
	}
};
