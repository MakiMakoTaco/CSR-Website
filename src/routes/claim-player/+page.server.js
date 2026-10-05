import { createSession } from '$lib/server/session';
import { setSessionTokenCookie } from '$lib/server/session';
import { generateSessionToken } from '$lib/server/session';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (locals.session === null) {
		redirect(302, '/');
	}

	const sql = locals.sql;

	const playerList = await sql`
    SELECT id, name
    FROM players
    WHERE
      claimed = false
      AND id != ${locals.player.id}
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

		await invalidateSession(sql, locals.session.id);
		deleteSessionTokenCookie(event);

		try {
			const player = (
				await sql`
          SELECT *
          FROM players
          WHERE id = ${playerId}
        `
			)[0];

			await sql`
        DELETE FROM players
        WHERE id = ${playerId}
      `;

			const updatedPlayerId = (
				await sql`
        UPDATE players
        SET
          discord_id = ${player.discordId},
          about = ${player.about},
          avatar = ${player.avatar},
          name_color = ${player.nameColor},
          claimed = true
        WHERE id = ${selectedPlayerId}
        RETURNING id
      `
			)[0].id;

			const sessionToken = generateSessionToken();
			const session = await createSession(sql, sessionToken, updatedPlayerId);

			setSessionTokenCookie(event, sessionToken, session.expiresAt);

			return { success: true };
		} catch (error) {
			console.error(error);
			fail(412);
		}
	}
};
