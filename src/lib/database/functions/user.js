import sql from '$lib/database/db';

export async function createPlayer(
	data = { name: '', discord_id: '', avatar: '', name_color: '' }
) {
	const existingPlayer = (
		await sql`
    select exists(
      select 1
      from players
      where name = ${data.name}
    )    
    `
	)[0];

	if (existingPlayer.exists) throw new Error(`Player with name ${data.name} already exists`);

	const player = (
		await sql`
      INSERT INTO players 
      ${sql(data)}
      returning id, name, discord_id, avatar, name_color
    `
	)[0];

	return player;
}

export async function updatePlayer(
	newData = { name: '', avatar: '', name_color: '', about: '' },
	playerId
) {
	await sql`
      UPDATE players 
      SET ${sql(newData)}
      WHERE id = ${playerId}
    `;
}

export async function getPlayerFromDiscordId(discordId) {
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

export async function getPlayerFromId(playerId) {
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

export async function getPlayerClears(playerId) {
	const clears = await sql`
    SELECT *
    FROM player_progress
    JOIN mods ON player_progress.mod_id = mods.id
    WHERE player_id = ${playerId}
  `;

	return clears;
}
