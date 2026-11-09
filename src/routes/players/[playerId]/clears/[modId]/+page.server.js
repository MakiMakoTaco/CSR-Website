import { error } from '@sveltejs/kit';

export async function load({ fetch, params, locals }) {
	const sql = locals.sql;

	const clear = (
		await sql`
		SELECT
			pp.proof,
			pp.is_local_proof,
			pp.is_private,
			p.name AS player_name,
			m.name AS mod_name
		FROM player_progress pp
		JOIN players p
			ON p.id = pp.player_id
		JOIN mods m
			ON m.id = pp.mod_id
		WHERE
			pp.player_id = ${params.playerId}
			AND pp.mod_id = ${params.modId}
	`
	)[0];

	if (!clear || (clear.isPrivate && locals.player?.id !== Number(params.playerId))) {
		error(404, 'Clear not found');
	}

	const folderResponse = await fetch(`/proofs/${params.playerId}/${params.modId}`);
	const imageUrls = (await folderResponse.json()).map((file) => `/proofs/${file.name}`);

	return {
		playerName: clear.playerName,
		modName: clear.modName,
		proofLink: clear.isLocalProof ? null : clear.proof,
		imageUrls
	};
}
