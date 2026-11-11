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
	const playerId = locals.player.id;

	const requestedPlayer = (
		await sql`
		SELECT
			p.name
		FROM player_claims pc
		JOIN players p
			ON p.id = pc.requested_player_id
		WHERE pc.current_player_id = ${playerId}
	`
	)[0];

	if (requestedPlayer?.name) {
		return { playerList: [], requestedPlayer };
	}

	const playerList = await sql`
    SELECT
			*
    FROM players p
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

		const requestedPlayerClaimed = (
			await sql`
			SELECT
				id,
				discord_id,
				claimed
			FROM players
			WHERE id = ${playerClaim.requestedPlayerId}
		`
		)[0];

		if (
			!requestedPlayerClaimed ||
			(requestedPlayerClaimed.discordId && requestedPlayerClaimed.claimed)
		) {
			return fail(400, { error: 'Requested player has already been claimed' });
		}

		await sql`
			INSERT INTO
				player_claims
			${sql(playerClaim)}
		`;

		return { success: true, requestedPlayer: selectedPlayerId };
	}
};
