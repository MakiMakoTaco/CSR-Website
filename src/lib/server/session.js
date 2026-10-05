export async function invalidateSession(sql, sessionId) {
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
		maxAge: 0,
		secure: false
	});
}

export async function validateSessionToken(sql, token) {
	const sessionId = await hashSecret(token);
	const session = await getSession(sql, sessionId);
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
		expires: expiresAt,
		secure: false
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

export async function createSession(sql, token, playerId) {
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

async function getSession(sql, sessionId) {
	const now = new Date();

	const result = (
		await sql`
    SELECT s.id, s.player_id, s.expires_at, p.id AS player_id, p.name, p.about, p.discord_id, p.avatar, name_color, claimed, a.role
    FROM session s
		INNER JOIN players p ON s.player_id = p.id
		LEFT JOIN admins a ON a.player_id = p.id
    WHERE s.id = ${sessionId}
  `
	)?.[0];

	if (!result) {
		return { session: null, player: null };
	}

	const session = {
		id: result.id,
		playerId: result.playerId,
		expiresAt: new Date(result.expiresAt)
	};
	const player = {
		id: result.playerId,
		discordId: result.discordId,
		name: result.name,
		about: result.about,
		avatar: result.avatar,
		nameColor: result.nameColor,
		role: result.role,
		claimed: result.claimed
	};

	// Check expiration
	if (now.getTime() > session.expiresAt.getTime()) {
		await invalidateSession(sql, sessionId);
		return { session: null, player: null };
	}
	if (now.getTime() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await sql`
			UPDATE session
			SET expires_at = ${session.expiresAt.getTime()}
			WHERE session.id = ${session.id}
		`;
	}

	return { session, player };
}
