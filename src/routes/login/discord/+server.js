import { discord } from '$lib/server/oauth.js';
import { generateState } from 'arctic';

export async function GET({ cookies }) {
	const state = generateState();
	const scopes = ['identify'];
	const url = discord.createAuthorizationURL(state, null, scopes);

	cookies.set('discord_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
