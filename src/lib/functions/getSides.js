export async function getSidesWithStats(sql) {
	const sides = await sql`
		SELECT
			s.id,
			s.name,
			s.type,
			s.archived,
			s.color_plus,
			COUNT(pp.player_id)::int AS clear_count,
			COUNT(DISTINCT pp.player_id)::int AS unique_players
		FROM sides s
		LEFT JOIN tiers t
			ON t.side_id = s.id
		LEFT JOIN mods m
			ON m.tier_id = t.id
		LEFT JOIN player_progress pp
			ON pp.mod_id = m.id
			AND pp.cleared = true
		GROUP BY s.id, s.name, s.type, s.archived, s.color_plus
	`;

	return sides;
}

export async function getSides(sql, data = { select: '', name: '' }) {
	const query = sql`
		SELECT
			${data.select ? sql(data.select) : sql`*`}
		FROM sides
		${data.name ? sql`WHERE name = ${data.name}` : sql``}
		`;

	const sides = await query;

	return sides;
}

export async function getSideData(sql, sideId) {
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
