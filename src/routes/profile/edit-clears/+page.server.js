import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.session) {
		redirect(302, '/login');
	}

	const sql = locals.sql;

	const clears = await sql`
		SELECT
			pp.id,
			pp.mod_id,
			pp.proof,
			pp.is_local_proof,
			pp.cleared_date,
			pp.deaths,
			pp.time_taken,
			pp.is_fc,
			pp.public_notes,
			pp.is_private,
			pp.submitted_at,
			m.name,
			tp.name AS tier_name,
			tp.color AS tier_color,
			tp.color_plus AS tier_color_plus,
			tp.side_index,
			s.id AS side_id,
			s.name AS side_name,
			s.color AS side_color
		FROM player_progress pp
		JOIN mods m
			ON m.id = pp.mod_id
		JOIN tiers t
			ON t.id = m.tier_id
		JOIN tier_presets tp
			ON tp.id = t.preset_id
		JOIN sides s
			ON s.id = t.side_id
		WHERE pp.player_id = ${locals.player.id}
		ORDER BY pp.submitted_at DESC NULLS LAST, pp.id DESC
	`;

	return { clears };
}

async function deleteImages(platform, playerId, modId) {
	const images = await platform.env.R2.list({ prefix: `${playerId}/${modId}/` });

	if (images.objects.length > 0) {
		await platform.env.R2.delete(images.objects.map((image) => image.key));
	}
}

export const actions = {
	update: async ({ request, locals, platform }) => {
		if (!locals.session) {
			return fail(401);
		}

		const sql = locals.sql;
		const data = await request.formData();
		const playerId = locals.player.id;

		const clear = (
			await sql`
			SELECT
				id, mod_id, is_local_proof
			FROM player_progress
			WHERE
				id = ${data.get('id')}
				AND player_id = ${playerId}
		`
		)[0];

		if (!clear) {
			return fail(404, { error: 'Clear not found' });
		}

		const newData = {};

		let proof = data.get('proof')?.trim();
		if (proof) {
			try {
				proof = proof
					.split(' ')
					.filter((link) => link)
					.map((link) => (/^https?:\/\//i.test(link) ? link : `https://${link}`))
					.map((link) => new URL(link).href)
					.join(' ');
			} catch (error) {
				return fail(400, { id: clear.id, error: 'Proof must be a valid URL' });
			}

			newData.proof = proof;
			newData.isLocalProof = false;
		} else if (!clear.isLocalProof) {
			return fail(400, { id: clear.id, error: 'Proof cannot be empty' });
		}

		const deaths = data.get('deaths');
		const hours = data.get('hours');
		const minutes = data.get('minutes');
		const seconds = data.get('seconds');

		if (deaths < 0) {
			return fail(400, { id: clear.id, error: 'Deaths cannot be less than 0' });
		}

		if (hours < 0 || minutes < 0 || seconds < 0) {
			return fail(400, { id: clear.id, error: 'Time taken cannot be less than 0' });
		}

		if (minutes > 59 || seconds > 59) {
			return fail(400, {
				id: clear.id,
				error: 'Time taken (minutes, seconds) cannot be greater than 59'
			});
		}

		newData.clearedDate = data.get('clearedDate') || null;
		newData.deaths = deaths || null;
		newData.timeTaken =
			hours || minutes || seconds
				? (Number(hours ?? 0) * 60 + Number(minutes ?? 0)) * 60 + Number(seconds ?? 0)
				: null;
		newData.isFc = data.has('isFc') ? true : null;
		newData.publicNotes = data.get('publicNotes') || null;
		newData.isPrivate = data.has('isPrivate');

		await sql`
			UPDATE player_progress
			SET
				${sql(newData)},
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ${clear.id}
		`;

		if (clear.isLocalProof && newData.proof) {
			await deleteImages(platform, playerId, clear.modId);
		}

		return { id: clear.id, success: true };
	},

	remove: async ({ request, locals, platform }) => {
		if (!locals.session) {
			return fail(401);
		}

		const sql = locals.sql;
		const data = await request.formData();
		const playerId = locals.player.id;

		const clear = (
			await sql`
			DELETE FROM player_progress
			WHERE
				id = ${data.get('id')}
				AND player_id = ${playerId}
			RETURNING mod_id, is_local_proof
		`
		)[0];

		if (!clear) {
			return fail(404, { error: 'Clear not found' });
		}

		if (clear.isLocalProof) {
			await deleteImages(platform, playerId, clear.modId);
		}

		return { removed: true };
	}
};
