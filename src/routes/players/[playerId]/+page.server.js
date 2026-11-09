import { getPlayerClears, getPlayerFromId } from '$lib/functions/user.js';
import { error } from '@sveltejs/kit';

async function getPlayerRoles(sql, playerId) {
	const tiers = await sql`
		SELECT
			s.id AS side_id,
			s.name AS side_name,
			s.clears_for_rank AS side_clears_for_rank,
			s.color AS side_color,
			s.color_plus AS side_color_plus,
			s.shoutout_on_clear,
			tp.name,
			tp.append_side_name,
			tp.color,
			tp.color_plus,
			t.clears_for_rank,
			COUNT(m.id)::int AS mod_count,
			COUNT(pp.id)::int AS clears
		FROM sides s
		JOIN tiers t
			ON t.side_id = s.id
		JOIN tier_presets tp
			ON tp.id = t.preset_id
		LEFT JOIN mods m
			ON m.tier_id = t.id
		LEFT JOIN player_progress pp
			ON pp.mod_id = m.id
			AND pp.player_id = ${playerId}
			AND NOT pp.is_private
		GROUP BY s.id, t.id, tp.id
		ORDER BY s.id, tp.side_index
	`;

	const roles = [];
	const sides = new Map();

	for (const tier of tiers) {
		if (!sides.has(tier.sideId)) sides.set(tier.sideId, { ...tier, modCount: 0, clears: 0 });
		const side = sides.get(tier.sideId);
		side.modCount += tier.modCount;
		side.clears += tier.clears;

		if (!tier.clearsForRank || tier.clearsForRank <= 0 || tier.clears < tier.clearsForRank)
			continue;

		const plus = tier.clears >= tier.modCount;
		roles.push({
			name: `${tier.name}${plus ? '+' : ''}${tier.appendSideName ? ` ${tier.sideName}` : ''}`,
			color: plus ? tier.colorPlus : tier.color,
			plus,
			catstare: tier.name.startsWith('Catstare')
		});
	}

	for (const side of sides.values()) {
		if (side.sideClearsForRank) {
			if (side.clears < side.sideClearsForRank) continue;

			const plus = side.clears >= side.modCount;
			roles.push({
				name: `${side.sideName}${plus ? '+' : ''}`,
				color: plus ? side.sideColorPlus : side.sideColor,
				plus
			});
		} else if (side.shoutoutOnClear && side.modCount > 0 && side.clears >= side.modCount) {
			roles.push({ name: `The Frog ${side.sideName}`, color: '93c47d', plus: true });
		}
	}

	return roles;
}

export async function load({ params, locals }) {
	if (!Number(params.playerId)) error(404);

	const sql = locals.sql;

	const player = await getPlayerFromId(sql, params.playerId);
	const clears = await getPlayerClears(sql, params.playerId);

	if (!player || player.length === 0) error(404);

	return {
		player,
		clears: clears.filter((clear) => !clear.is_private),
		roles: await getPlayerRoles(sql, params.playerId)
	};
}
