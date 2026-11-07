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

	console.log('Updating player');

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

	console.log('Updating session');

	await sql`
    UPDATE
      session
    SET player_id = ${requested.id}
    WHERE player_id = ${current.id}
  `;

	console.log('Deleting old player');

	await sql`
    DELETE FROM
      players
    WHERE id = ${current.id}
  `;

	console.log('Successful, returning');

	return Response.json({ success: true });
}
