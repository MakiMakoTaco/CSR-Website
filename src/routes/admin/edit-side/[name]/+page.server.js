import { getSides } from '$lib/functions/getSides';
import { getTiers } from '$lib/functions/getTiers.js';

import { error, fail } from '@sveltejs/kit';

async function getData(locals, id) {
	const sql = locals.sql;

	const tiers = await getTiers(sql, id);

	if (tiers.length === 0) return tiers;

	const mods = await sql`
		SELECT m.*, md.page
		FROM mods m
		JOIN mod_data md
			ON md.id = m.mod_data_id
		WHERE m.tier_id IN ${sql(tiers.map((tier) => tier.id))}
		ORDER BY UPPER(m.name) ASC
	`;

	for (let i = 0; i < tiers.length; i++) {
		tiers[i].mods = mods.filter((mod) => mod.tierId === tiers[i].id);
	}

	return tiers;
}

export async function load({ params, locals }) {
	const sql = locals.sql;

	const side = (await getSides(sql, { name: params.name }))[0];

	return {
		side: { ...side, tiers: getData(locals, side.id) }
	};
}

function findUpdateTable(key) {
	const updateKeys = { mods: ['name', 'notes'], modData: ['page'] };

	for (const table in updateKeys) {
		if (updateKeys[table].includes(key)) {
			return table;
		}
	}
}

export const actions = {
	updateMod: async ({ request, locals }) => {
		const sql = locals.sql;

		const form = await request.formData();

		const modId = form.get('id');
		if (!modId) {
			return fail(412, { error: 'Missing modID' });
		}

		const mod = (
			await sql`
			SELECT m.*, md.page
			FROM mods m
			JOIN mod_data md
				ON md.id = m.mod_data_id
			WHERE m.id = ${modId}
		`
		)[0];
		if (!mod) {
			return fail(404, { error: 'Error finding mod with requested ID' });
		}

		let updates = {};

		for (const [key, value] of form) {
			if (key === 'id' && (mod[key] ?? '').toString().trim() != value.trim()) {
				return fail(417, {
					error: "Something went wrong, received and fetched mod IDs somehow don't match"
				});
			}

			if ((mod[key] ?? '').toString().trim() != value.trim()) {
				updates[key] = value.trim();
			}
		}

		if (Object.keys(updates).length === 0) return;

		const modDataUpdates = {};
		for (const key in updates) {
			if (findUpdateTable(key) === 'modData') {
				modDataUpdates[key] = updates[key];
				delete updates[key];
			}
		}

		if (modDataUpdates.page === '') {
			return fail(400, { error: 'Map link cannot be empty' });
		}

		if (Object.keys(updates).length > 0) {
			await sql`
				UPDATE mods
				SET ${sql(updates)}
				WHERE id = ${modId}
			`;
		}

		if (Object.keys(modDataUpdates).length > 0) {
			await sql`
				UPDATE mod_data
				SET ${sql(modDataUpdates)}
				WHERE id = ${mod.modDataId}
			`;
		}

		return { success: true };
	}
};
