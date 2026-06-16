import sql from '$lib/database/db.js';
import { getPlayerClears, getPlayerFromId } from '$lib/database/functions/user.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	if (!Number(params.playerId)) error(404);

	const player = await getPlayerFromId(params.playerId);
	const clears = await getPlayerClears(params.playerId);

	if (!player || player.length === 0) error(404);

	return { player, clears: clears.filter((clear) => !clear.is_private) };
}
