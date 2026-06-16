import sql from '$lib/database/db';

export async function getTiers(sideId = '') {
	const tiers = await sql`
    select
      tiers.id, clears_for_rank, name, append_side_name, color, color_plus, side_index
    from tier_presets
    join tiers on tiers.preset_id = tier_presets.id
    ${sideId ? sql`where side_id = ${sideId}` : sql``}
    `;

	// make sure there aren't any tier overrides

	return tiers;
}
