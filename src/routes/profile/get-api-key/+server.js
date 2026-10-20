import { createApiKey, hashApiKey } from '$lib/api/key.js';
import { error } from '@sveltejs/kit';

export async function POST({ locals }) {
	const sql = locals.sql;

	let inserted = false;
	let attempts = 0;
	let rawApiKey;

	while (!inserted && attempts < 3) {
		const id = Buffer.from(crypto.getRandomValues(new Uint8Array(4))).toString('hex');
		const key = Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString('hex');
		rawApiKey = `${id}${key}`;

		inserted = await createApiKey(sql, {
			id,
			playerId: locals.player.id,
			secret: key,
			updatedAt: new Date()
		});

		attempts++;
	}

	if (!inserted) {
		error(500, {
			message: 'Unable to generate an API key'
		});
	}

	return Response.json({ apiKey: rawApiKey });
}
