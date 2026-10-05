import { getClearedPlayers } from '$lib/functions/getMods.js';

export async function load({ url, params, locals }) {
	const sql = locals.sql;

	const players = await getClearedPlayers(sql, params.id);
	players.forEach((player) => {
		if (new RegExp(['youtube.com', 'youtu.be', 'twitch.tv'].join('|')).test(player.proof)) {
			player.is_video = true;
		} else {
			player.is_video = false;
		}

		if (!player.proof.includes('https')) {
			player.proof = url.origin + player.proof;
		}
	});

	return {
		players: players
	};
}
