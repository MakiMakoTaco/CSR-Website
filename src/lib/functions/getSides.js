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

export async function getSideByName(sql, name, playerId = null) {
	const side = (
		await sql`
		SELECT
			s.name,
			s.clears_for_rank,
			s.color,
			s.archived,
			s.quick_install,
			s.show_tier_names,
			json_agg(
				json_build_object(
					'name', tp.name,
					'color', tp.color,
					'color_plus', tp.color_plus,
					'append_side_name', tp.append_side_name,
					'clears_for_rank', t.clears_for_rank,
					'mods', m.mods
				)
				ORDER BY tp.side_index
			) AS tiers
		FROM sides s
		JOIN tiers t
			ON t.side_id = s.id
		JOIN tier_presets tp
			ON tp.id = t.preset_id		
		CROSS JOIN LATERAL (
			SELECT
				json_agg(
					json_build_object(
						'id', m.id,
						'name', m.name,
						'notes', m.notes
						${playerId ? sql`, 'cleared', pp.cleared` : sql``}
					)
					ORDER BY m.name
				) AS mods
			FROM mods m
			${
				playerId
					? sql`LEFT JOIN player_progress pp
				ON pp.mod_id = m.id
				AND pp.player_id = ${playerId}`
					: sql``
			}
			WHERE m.tier_id = t.id
		) m
		WHERE s.name = ${name}
		GROUP BY s.id, s.name, s.clears_for_rank, s.color, s.archived, s.quick_install, s.show_tier_names
	`
	)[0];

	return side;
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
