export async function hashApiKey(key) {
	const secretBytes = new TextEncoder().encode(key);
	const hashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	const secretHash = Buffer.from(hashBuffer).toString('hex');

	return secretHash;
}

export async function createApiKey(sql, data = { id, playerId, secret, updatedAt }) {
	data.hashedSecret = await hashApiKey(data.secret);
	delete data.secret;

	try {
		await sql`
			INSERT INTO api_keys
			${sql(data)}
			ON CONFLICT (player_id)
			DO UPDATE
			SET
				id = ${data.id},
				hashed_secret = ${data.hashedSecret},
				updated_at = ${data.updatedAt}
		`;

		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

export async function fetchPlayer(sql, keyId) {
	const player = (
		await sql`
		SELECT
			p.*,
			hashed_secret
		FROM players p
		JOIN api_keys ak
			ON ak.player_id = p.id
		WHERE ak.id = ${keyId}
	`
	)[0];

	if (!player) return null;

	const hashedSecret = player.hashedSecret;
	delete player.hashedSecret;

	return { hashedSecret, player };
}
