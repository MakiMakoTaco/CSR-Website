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

export async function updatePlayer(
	sql,
	newData = { name: '', avatar: '', nameColor: '', about: '' },
	playerId
) {
	await sql`
      UPDATE players 
      SET ${sql(newData)}
      WHERE id = ${playerId}
    `;
}

export async function getPlayerFromDiscordId(sql, discordId) {
	const player = (
		await sql`
    SELECT id, name, avatar, name_color, about
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
    SELECT name, discord_id, avatar, name_color, about
    FROM players
    WHERE id = ${playerId}
    LIMIT 1
  `
	)[0];

	return player;
}

export async function getPlayerClears(sql, playerId) {
	const clears = await sql`
    SELECT *
    FROM player_progress pp
    JOIN mods m
      ON pp.mod_id = m.id
    WHERE player_id = ${playerId}
  `;

	return clears;
}
