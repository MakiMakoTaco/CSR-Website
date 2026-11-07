export async function load({ locals }) {
	const sql = locals.sql;

	const players = (
		await sql`
    SELECT
      p1.id AS requested_id,
      p2.id AS current_id,
      p1.name AS requested_name,
      p2.name AS current_name,
      p2.discord_id,
      p2.about,
      p2.avatar,
      p2.name_color
    FROM player_claim pc
    JOIN players p1
      ON p1.id = pc.requested_player_id
    JOIN players p2
      ON p2.id = pc.current_player_id
  `
	).map((player) => ({
		requested: { id: player.requestedId, name: player.requestedName },
		current: {
			id: player.currentId,
			name: player.currentName,
			discordId: player.discordId,
			about: player.about,
			avatar: player.avatar,
			nameColor: player.nameColor ?? '000000'
		}
	}));

	return { pendingPlayers: players };
}
