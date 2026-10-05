import { closeConnection, createSql, getConnectionString } from '$lib/server/db';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken
} from '$lib/server/session';
import { sequence } from '@sveltejs/kit/hooks';

function dbConnection({ event, resolve }) {
	const connectionString = getConnectionString(event.platform);

	if (connectionString) {
		event.locals.sql = createSql(connectionString);
	}

	return resolve(event);
	// try {
	// } finally {
	// 	closeConnection(event.locals.sql);
	// }
}

async function getSession({ event, resolve }) {
	const sql = event.locals.sql;
	const token = event.cookies.get('session') ?? null;

	if (token === null) {
		event.locals.player = null;
		event.locals.session = null;

		return resolve(event);
	}

	// Validate session token
	const { session, player } = await validateSessionToken(sql, token);

	if (session !== null) {
		setSessionTokenCookie(event, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.session = session;
	event.locals.player = player;

	return resolve(event);
}

export const handle = sequence(dbConnection, getSession);
