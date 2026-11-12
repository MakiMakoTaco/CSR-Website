import { getClearedPlayers } from '$lib/functions/getMods.js';

export async function load({ url, params, locals }) {
	const sql = locals.sql;

	const players = await getClearedPlayers(sql, params.id, locals.player?.id);
	const videoCheck = new RegExp(['youtube.com', 'youtu.be', 'twitch.tv'].join('|'));
	players.forEach((player, index) => {
		player.proof = player.isLocalProof
			? [{ link: `/players/${player.id}/clears/${params.id}`, type: 'Screenshot' }]
			: player.proof.split(' ').map((proof) => {
					return {
						link: proof,
						type: videoCheck.test(proof) ? 'Video' : 'Screenshot'
					};
				});

		if (player.proof.length > 2) {
			player.proof = [
				{
					link: `/players/${player.id}/clears/${params.id}`,
					type: 'Collection'
				}
			];
		}
	});

	return {
		players: players
	};
}
