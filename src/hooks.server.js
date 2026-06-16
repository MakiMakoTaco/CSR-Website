import sql from '$lib/database/db';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken
} from '$lib/server/session';

export const handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') ?? null;

	if (token === null) {
		event.locals.player = null;
		event.locals.session = null;

		return resolve(event);
	}

	// Validate session token
	const { session, player } = await validateSessionToken(token);

	if (session !== null) {
		setSessionTokenCookie(event, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.session = session;
	event.locals.player = player;

	return resolve(event);
};
