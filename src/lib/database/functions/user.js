import sql from '$lib/database/db';

export async function createPlayer(
	data = { name: '', discord_id: '', avatar: '', name_color: '' }
) {
	const player = (
		await sql`
      INSERT INTO players 
      ${sql(data)}
      returning id, name, discord_id, avatar, name_color
    `
	)[0];

	return player;
}

export async function getPlayerFromDiscordId(discordId) {
	const player = (
		await sql`
    SELECT id, name, avatar, name_color, about_me
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
    SELECT name, discord_id, avatar, name_color, about_me
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
