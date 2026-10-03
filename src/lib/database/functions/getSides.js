import sql from '$lib/database/db';

export async function getSides(data = { select: '', name: '' }) {
	const query = sql`
		SELECT
			${data.select ? sql(data.select) : sql`*`}
		FROM sides
		${data.name ? sql`WHERE name = ${data.name}` : sql``}
		`;

	const sides = await query;

	return sides;
}

export async function getSideData(sideId) {
	if (!sideId) {
		throw new Error('Getting side data requires a side ID');
	}

	const sideData = await sql`
		SELECT *
		FROM sides
		WHERE id = ${sideId}
	`;

	const tierIds = (
		await sql`
		SELECT id
		FROM tiers
		WHERE side_id = ${sideId}
	`
	).map((tier) => tier.id);

	const modIds = (
		await sql`
		SELECT id
		FROM mods
		WHERE tier_id IN ${sql(tierIds)}
	`
	).map((mod) => mod.id);

	const sideClears = await sql`
		SELECT player_id
		FROM player_progress
		WHERE mod_id
			IN ${sql(modIds)}
			AND cleared = true
	`;

	const uniquePlayers = [...new Set(sideClears.map((player) => player.playerId))].length;

	return { clearCount: sideClears.length, uniquePlayers };
}
