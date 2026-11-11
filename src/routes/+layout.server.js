import { getSidesWithStats } from '$lib/functions/getSides';

async function getPlayerSearchData(sql) {
	return await sql`
		SELECT
			id,
			name,
			name_color
		FROM players
	`;
}

async function getTierSearchData(sql, isAdmin) {
	return await sql`
		SELECT
			t.id,
			tp.name,
			tp.color,
			tp.color_plus,
			t.side_id,
			tp.side_index,
			json_agg(
				json_build_object(
					'id', m.id,
					'name', m.name
				)
				ORDER BY lower(m.name)
			) AS mods
		FROM tiers t
		JOIN tier_presets tp
			ON tp.id = t.preset_id
		JOIN mods m
			ON m.tier_id = t.id
		${!isAdmin ? sql`WHERE NOT t.side_id IN (SELECT id FROM sides s WHERE s.is_private = true)` : sql``}
		GROUP BY t.id, tp.name, tp.side_index, tp.color, tp.color_plus
	`;
}

export async function load({ locals }) {
	const sql = locals.sql;

	const sides = await getSidesWithStats(sql);

	return {
		sides,
		player: locals.player,
		search: {
			players: getPlayerSearchData(sql),
			tiers: getTierSearchData(sql, locals.player.role === 'admin')
		}
	};
}
