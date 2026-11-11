import { error } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	if (!locals.player?.role === 'admin') {
		error(403);
	}

	const sql = locals.sql;

	const { current, requested } = await request.json();
	if (current.id === requested.id) {
		error(400, { error: 'Player IDs are the same' });
	}

	await sql`
    UPDATE
      players
    SET
      discord_id = ${current.discordId},
      about = ${current.about},
      avatar = ${current.avatar},
      name_color = ${current.nameColor},
      claimed = true
    WHERE id = ${requested.id}
  `;

	await sql`
    UPDATE
      session
    SET player_id = ${requested.id}
    WHERE player_id = ${current.id}
  `;

	await sql`
    DELETE FROM
      players
    WHERE id = ${current.id}
  `;

	return Response.json({ success: true });
}

export async function DELETE({ url, locals }) {
	if (!locals.player?.role === 'admin') {
		error(403);
	}

	const currentPlayerId = url.searchParams.get('current-player-id');
	const requestedPlayerId = url.searchParams.get('requested-player-id');

	const sql = locals.sql;

	await sql`
    DELETE FROM
      player_claims pc
    WHERE
      current_player_id = ${currentPlayerId}
      AND requested_player_id = ${requestedPlayerId}
  `;

	return Response.json({ success: true });
}
