import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '$env/static/private';
import sql from '$lib/database/db.js';
import { createPlayer, getPlayerFromDiscordId } from '$lib/database/functions/user.js';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/session.js';

export async function GET(event) {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('discord_oauth_state') ?? null;

	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400
		});
	}

	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	const result = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams({
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code: code,
			grant_type: 'authorization_code',
			redirect_uri: REDIRECT_URI,
			scope: 'identify'
		}).toString(),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

	const tokens = await result.json();
	const accessToken = tokens.access_token;
	const accessTokenExpiresAt = tokens.expires_in;
	const refreshToken = tokens.refresh_token;

	const response = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
	const discordUser = await response.json();

	const existingPlayer = await getPlayerFromDiscordId(discordUser.id);

	if (existingPlayer) {
		if (!existingPlayer.avatar) {
			const avatar = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`;

			await sql`
			UPDATE players
			SET avatar = ${avatar}
			WHERE id = ${existingPlayer.id}
			`;
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingPlayer.id);

		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/profile'
			}
		});
	}

	const newPlayer = await createPlayer({
		name: discordUser.global_name,
		discord_id: discordUser.id,
		avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`,
		name_color: discordUser.banner_color
	});

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, newPlayer.id);

	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/profile'
		}
	});
}
