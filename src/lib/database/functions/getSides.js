import sql from '$lib/database/db';

export async function getSides(data = { select: '', name: '' }) {
	const query = sql`
		select
			${data.select ? sql(data.select) : sql`*`}
		from sides
		${data.name ? sql`where name = ${data.name}` : sql``}
		`;

	const sides = await query;

	return sides;
}

export async function getSideData(sideId) {
	if (!sideId) {
		throw new Error('Getting side data requires a side ID');
	}

	const sideData = await sql`
		select
			*
		from sides
		where id = ${sideId}
	`;

	const tierIds = (
		await sql`
		select
			id
		from tiers
		where side_id = ${sideId}
	`
	).map((tier) => tier.id);

	const modIds = (
		await sql`
		select
			m.id
		from mods m
		join mod_tiers mt on mt.mod_id = m.id
		where tier_id in ${sql(tierIds)}
	`
	).map((mod) => mod.id);

	const sideClears = await sql`
		select
			player_id
		from player_progress
		where mod_id in ${sql(modIds)} and cleared = true
	`;

	const uniquePlayers = [...new Set(sideClears.map((player) => player.player_id))].length;

	return { clearCount: sideClears.length, uniquePlayers };
}
