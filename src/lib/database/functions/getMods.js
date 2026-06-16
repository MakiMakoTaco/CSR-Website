import sql from '$lib/database/db';

export async function getMods(tierId = '') {
	const mods = await sql`
    select
      *
    from mods
    join mod_tiers on mod_tiers.mod_id = mods.id
    ${tierId ? sql`where tier_id = ${tierId}` : sql``}
    `;

	return mods;
}

export async function getModData(modId) {
	if (!modId) {
		throw new Error('Getting mod data requires a mod ID');
	}

	const download_links = await sql`
		select
			*
		from download_links
		where mod_id = ${modId}
	`;

	const mod = await sql`
		select
			*
		from mods
		where id = ${modId}
	`;

	const modData = { ...mod[0], downloads: [...download_links] };

	return modData;
}

export async function getClearedPlayers(modId) {
	if (!modId) {
		throw new Error('Getting clears for a mod requires a mod ID');
	}

	const clearedPlayers = await sql`
		select
			p.id, name, proof, is_fc, cleared_date, is_private, public_notes, mod_notes
		from player_progress pp
		join players p on player_id = p.id
		where mod_id = ${modId} and cleared = true
	`;

	return clearedPlayers;
}
