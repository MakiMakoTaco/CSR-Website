import { getSides } from '$lib/functions/getSides';
import { getTiers } from '$lib/functions/getTiers.js';
import { getModData, getMods } from '$lib/functions/getMods.js';

import { error, fail } from '@sveltejs/kit';

async function getData(locals, id) {
	const sql = locals.sql;

	const tiers = await getTiers(sql, id);

	for (let i = 0; i < tiers.length; i++) {
		const mods = [...(await getMods(sql, tiers[i].id))];
		tiers[i].mods = mods.map((mod) => ({ data: getModData(sql, mod.id) }));
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
		console.log(table, updateKeys[table]);
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
			fail(412, { error: 'Missing modID' });
		}

		const mod = await getModData(sql, modId);
		if (!mod) {
			fail(404, { error: 'Error finding mod with requested ID' });
		}

		let updates = {};

		for (const [key, value] of form) {
			if (key === 'id' && (mod[key] ?? '').toString().trim() != value.trim()) {
				fail(417, {
					error: "Something went wrong, received and fetched mod IDs somehow don't match"
				});
			}

			if ((mod[key] ?? '').toString().trim() != value.trim()) {
				updates[key] = value.trim();
			}
		}

		if (Object.keys(updates).length === 0) return;

		await sql`
			UPDATE mods
			SET ${sql(updates)}
			WHERE id = ${modId}
		`;

		return { success: true };
	}
};
