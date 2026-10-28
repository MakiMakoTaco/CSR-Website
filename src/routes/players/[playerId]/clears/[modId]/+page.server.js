export async function load({ fetch, params, locals }) {
	const sql = locals.sql;

	const folderResponse = await fetch(`/proofs/${params.playerId}/${params.modId}`);
	let imageUrls = (await folderResponse.json()).map((file) => `/proofs/${file.name}`);

	if (!imageUrls || imageUrls.length < 1) {
		const proof = (
			await sql`
			SELECT
				proof
			FROM player_progress
			WHERE
				player_id = ${params.playerId}
				AND mod_id = ${params.modId}
		`
		)[0]?.proof;

		if (proof) {
			imageUrls = proof;
		}
	}

	return { imageUrls };
}
