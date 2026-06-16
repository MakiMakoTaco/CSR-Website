import { Discord } from 'arctic';
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '$env/static/private';

export const discord = new Discord(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
