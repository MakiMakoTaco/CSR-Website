export async function getTiers(sql, sideId = '') {
	const tiers = await sql`
    SELECT
      t.id,
      name,
      color,
      color_plus,
      clears_for_rank,
      append_side_name,
      side_index
    FROM tier_presets tp
    JOIN tiers t
      ON t.preset_id = tp.id
    ${sideId ? sql`WHERE side_id = ${sideId}` : sql``}
    `;

	// make sure there aren't any tier overrides

	return tiers;
}
