import { getPlayerClears, getPlayerFromId } from '$lib/functions/user.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	if (!Number(params.playerId)) error(404);

	const sql = locals.sql;

	const player = await getPlayerFromId(sql, params.playerId);
	const clears = await getPlayerClears(sql, params.playerId);

	if (!player || player.length === 0) error(404);

	return { player, clears: clears.filter((clear) => !clear.is_private) };
}
