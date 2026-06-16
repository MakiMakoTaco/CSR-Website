import sql from '$lib/database/db';

export async function invalidateSession(sessionId) {
	await sql`
		DELETE FROM session
		WHERE id = ${sessionId}
	`;
}

export function deleteSessionTokenCookie(event) {
	event.cookies.set('session', '', {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		maxAge: 0
	});
}

export async function validateSessionToken(token) {
	const sessionId = await hashSecret(token);
	const session = await getSession(sessionId);
	if (!session) {
		return null;
	}

	return session;
}

export function setSessionTokenCookie(event, token, expiresAt) {
	event.cookies.set('session', token, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		expires: expiresAt
	});
}

async function hashSecret(secret) {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	return new Uint8Array(secretHashBuffer);
}

export function generateSessionToken() {
	const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';

	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = '';
	for (let i = 0; i < bytes.length; i++) {
		id += alphabet[bytes[i] >> 3];
	}

	return id;
}

export async function createSession(token, playerId) {
	const now = new Date();

	const sessionId = await hashSecret(token);
	const session = {
		id: sessionId,
		playerId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};

	await sql`
    INSERT INTO session (id, player_id, expires_at)
    VALUES (${session.id}, ${session.playerId}, ${new Date(Math.floor(session.expiresAt.getTime())).toISOString()})
  `;

	return session;
}

async function getSession(sessionId) {
	const now = new Date();

	const result = (
		await sql`
    SELECT session.id, session.player_id, session.expires_at, players.id as player_id, players.name, players.about_me, players.discord_id, players.avatar, players.name_color, admins.role
    FROM session
		INNER JOIN players ON session.player_id = players.id
		LEFT JOIN admins ON admins.player_id = players.id
    WHERE session.id = ${sessionId}
  `
	)?.[0];

	if (!result) {
		return { session: null, player: null };
	}

	const session = {
		id: result.id,
		playerId: result.player_id,
		expiresAt: new Date(result.expires_at)
	};
	const player = {
		id: result.player_id,
		discordId: result.discord_id,
		name: result.name,
		about: result.about_me,
		avatar: result.avatar,
		nameColor: result.name_color,
		role: result.role
	};

	// Check expiration
	if (now.getTime() > session.expiresAt.getTime()) {
		await invalidateSession(sessionId);
		return { session: null, player: null };
	}
	if (now.getTime() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await sql`
			UPDATE session
			SET expires_at = ${new Date(Math.floor(session.expiresAt.getTime() / 1000)).toISOString()}
			WHERE session.id = ${session.id}
		`;
	}

	return { session, player };
}
