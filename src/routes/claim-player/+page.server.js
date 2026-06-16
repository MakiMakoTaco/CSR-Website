import sql from '$lib/database/db';

export async function load() {
	const playerList = await sql`
    SELECT id, name
    FROM players
  `;

	return { playerList };
}
