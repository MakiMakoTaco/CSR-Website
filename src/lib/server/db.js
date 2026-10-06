import postgres from 'postgres';

export function createSql(connectionString) {
	return postgres(connectionString, {
		max: 5,
		fetch_types: false,
		prepare: true,
		transform: postgres.camel
	});
}

export function getConnectionString(platform) {
	return platform?.env?.HYPERDRIVE?.connectionString;
}
