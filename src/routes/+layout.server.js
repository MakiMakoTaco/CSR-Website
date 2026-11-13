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

async function getTierSearchData(sql, player) {
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
					'name', m.name,
					'cleared', m.cleared
				)
				ORDER BY lower(m.name)
			) AS mods
		FROM tiers t
		JOIN tier_presets tp
			ON tp.id = t.preset_id
		LEFT JOIN (
			SELECT
				m.tier_id,
				m.id,
				m.name,
				pp.cleared
			FROM mods m
			LEFT JOIN player_progress pp
				ON
					pp.mod_id = m.id
					AND pp.cleared = true
					AND pp.player_id = ${player.id}
			GROUP BY m.id, pp.cleared
		) m ON m.tier_id = t.id
		${!player?.role ? sql`WHERE NOT t.side_id IN (SELECT id FROM sides s WHERE s.is_private = true)` : sql``}
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
			tiers: getTierSearchData(sql, locals.player)
		}
	};
}
