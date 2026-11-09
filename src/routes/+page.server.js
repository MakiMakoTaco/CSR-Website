export async function load({ locals }) {
	const sql = locals.sql;

	const recentSubmissions = (
		await sql`
    SELECT
      json_build_object(
        'player', json_build_object(
          'id', p.id,
          'name', p.name,
          'color', p.name_color
        ),
        'mod', json_build_object(
          'id', m.id,
          'name', m.name,
          'tier_name', tp.name,
          'tier_color', tp.color_plus,
          'side_name', s.name
        )
      ) submission
    FROM player_progress pp
    JOIN players p
      ON p.id = pp.player_id
    JOIN mods m
      ON m.id = pp.mod_id
    JOIN tiers t
      ON t.id = m.tier_id
    JOIN tier_presets tp
      ON tp.id = t.preset_id
    JOIN sides s
      ON s.id = t.side_id
    WHERE NOT pp.is_private
      OR pp.player_id = ${locals.player?.id ?? null}
    ORDER BY pp.id DESC
    LIMIT 18
  `
	).map((row) => row.submission);

	return { recentSubmissions };
}
