export async function createPlayer(
	sql,
	data = { name: '', discordId: '', avatar: '', nameColor: '' }
) {
	const existingPlayer = (
		await sql`
    SELECT EXISTS(
      SELECT 1
      FROM players
      WHERE name = ${data.name}
    )    
    `
	)[0];

	if (existingPlayer.exists) throw new Error(`Player with name ${data.name} already exists`);

	const player = (
		await sql`
      INSERT INTO players 
      ${sql(data)}
      RETURNING id, name, discord_id, avatar, name_color
    `
	)[0];

	return player;
}

export async function updatePlayer(sql, newData, playerId) {
	await sql`
      UPDATE players 
      SET ${sql(newData)}
      WHERE id = ${playerId}
    `;
}

export async function getPlayerFromDiscordId(sql, discordId) {
	const player = (
		await sql`
    SELECT
      id,
      name,
      avatar,
      name_color,
      about
    FROM players
    WHERE discord_id = ${discordId}
    LIMIT 1
  `
	)[0];

	return player;
}

export async function getPlayerFromId(sql, playerId) {
	const player = (
		await sql`
    SELECT name, discord_id, avatar, name_color, about, private_stats
    FROM players
    WHERE id = ${playerId}
    LIMIT 1
  `
	)[0];

	return player;
}

export async function getPlayerClears(sql, playerId) {
	const clears = await sql`
    SELECT
      pp.id,
      pp.mod_id,
      pp.proof,
      pp.is_local_proof,
      pp.cleared_date,
      pp.deaths,
      pp.time_taken,
      pp.is_fc,
      pp.public_notes,
      pp.is_private,
      pp.submitted_at,
      m.name,
      tp.name AS tier_name,
      tp.color AS tier_color,
      tp.color_plus AS tier_color_plus,
      tp.side_index,
      s.id AS side_id,
      s.name AS side_name
    FROM player_progress pp
    JOIN mods m
      ON pp.mod_id = m.id
    JOIN tiers t
      ON t.id = m.tier_id
    JOIN tier_presets tp
      ON tp.id = t.preset_id
    JOIN sides s
      ON s.id = t.side_id
    WHERE player_id = ${playerId}
    ORDER BY pp.submitted_at DESC NULLS LAST, pp.id DESC
  `;

	return clears;
}
