import { getClearedPlayers } from '$lib/functions/getMods.js';

export async function load({ url, params, locals }) {
	const sql = locals.sql;

	const players = await getClearedPlayers(sql, params.id);
	players.forEach((player, index) => {
		if (new RegExp(['youtube.com', 'youtu.be', 'twitch.tv'].join('|')).test(player.proof)) {
			player.is_video = true;
		} else {
			player.is_video = false;
		}

		if (player.isLocalProof) {
			player.proof = `/players/${player.id}/clears/${params.id}`;
		}
	});

	return {
		players: players
	};
}
