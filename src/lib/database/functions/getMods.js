import sql from '$lib/database/db';

export async function getMods(tierId = '') {
	const mods = await sql`
    select
      *
    from mods m
    ${tierId ? sql`where tier_id = ${tierId}` : sql``}
    `;

	return mods;
}

export async function getModNames() {
	const names = await sql`
	select
		id, gb_name, shorthand
	from mod_data
	`;

	return names;
}

export async function getModData(modId) {
	if (!modId) {
		throw new Error('Getting mod data requires a mod ID');
	}

	const mod = (
		await sql`
		select
			*
		from mod_data md
		join mods m on md.id = m.mod_data_id
		where m.id = ${modId}
	`
	)[0];

	mod.submitter = (
		await sql`
		select *
		from contributors
		where id = ${mod.submitter_id}
		`
	)[0];

	mod.children = await sql`
		select id, gb_name
		from mod_data
		where parent_id = ${mod.mod_data_id}
		ORDER BY gb_name ASC
		`;

	if (mod.children.length > 0) {
		console.log(true);

		for (let i = 0; i < mod.children.length; i++) {
			mod.children[i].download = {
				everest: (
					await sql`
				SELECT *
				FROM download_links
				WHERE mod_data_id = ${mod.children[i].id}
				`
				)[0]
			};
		}
	} else {
		mod.downloads = await sql`
		select
			*
		from download_links
		where mod_data_id = ${mod.mod_data_id}
	`;
	}

	return mod;
}

export async function getClearedPlayers(modId) {
	if (!modId) {
		throw new Error('Getting clears for a mod requires a mod ID');
	}

	const clearedPlayers = await sql`
		select
			p.id, name, proof, is_fc, cleared_date, is_private, public_notes, public_mod_notes
		from player_progress pp
		join players p on player_id = p.id
		where mod_id = ${modId} and cleared = true
	`;

	return clearedPlayers;
}
