import postgres from 'postgres';
import { env } from '$env/dynamic/private';

export function createSql(connectionString) {
	return postgres(connectionString, {
		max: 5,
		fetch_types: false,
		prepare: true,
		transform: postgres.camel
	});
}

// Fallback for local dev
export function getConnectionString(platform) {
	return platform?.env?.HYPERDRIVE?.connectionString ?? env.HYPERDRIVE_CONNECTION_STRING;
}

export function closeConnection(sql) {
	sql.end({ timeout: 0 }).catch(() => {});
}
