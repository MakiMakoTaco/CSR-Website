import { Discord } from 'arctic';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import { env } from '$env/dynamic/private';

export const discord = new Discord(CLIENT_ID, CLIENT_SECRET, env.DISCORD_REDIRECT_URI);
