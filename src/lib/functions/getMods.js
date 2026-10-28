export async function getMinModData(sql, modId) {
	if (!modId) throw new Error('Fetching mod data requires a mod ID');

	const mod = (
		await sql`
		SELECT
			m.name,
			md.description,
			md.id AS mod_data_id,
			md.page,
			md.gb_name,
			s.name AS side_name,
			CASE
				WHEN c.id IS NULL THEN
					NULL
				ELSE
					json_build_object(
						'id', c.id,
						'name', c.name,
						'profile', c.profile_url
					)
			END AS submitter,
			cgs.credits,
			dls.downloads
		FROM mods m
		JOIN mod_data md
			ON md.id = m.mod_data_id
		JOIN sides s
			ON s.id = (
				SELECT
					side_id
				FROM tiers t
				WHERE t.id = m.tier_id
			)
		LEFT JOIN contributors c
			ON c.id = md.submitter_id
		CROSS JOIN LATERAL (
			SELECT
				json_agg(
					json_build_object(
						'id', cg.id,
						'name', cg.name,
						'authors', (
							SELECT 
								json_agg(
									json_build_object(
										'id', ac.id,
										'name', ac.name,
										'role_name', a.role_name
									)
								) AS authors
								FROM authors a
								JOIN contributors ac
									ON ac.id = a.contributor_id
								WHERE a.group_id = cg.id
							)
					)
				) AS credits
			FROM credit_groups cg
			WHERE cg.mod_data_id = md.id
		) AS cgs
		CROSS JOIN LATERAL (
			SELECT
				json_agg(
					json_build_object(
						'index', dl.order_index,
						'name', dl.file_name,
						'size', dl.file_size,
						'version', dl.version,
						'description', dl.description,
						'manual', dl.manual_url,
						'everest', dl.everest_url
					)
				) AS downloads
				FROM download_links dl
				WHERE dl.mod_data_id = md.id
		) AS dls
		WHERE m.id = ${modId}
	`
	)[0];

	return mod;
}

export async function getMods(sql, tierId = '') {
	const mods = await sql`
    SELECT *
    FROM mods
    ${tierId ? sql`WHERE tier_id = ${tierId}` : sql``}
		ORDER BY UPPER(name) ASC
    `;

	return mods;
}

export async function getModNames(sql) {
	const names = await sql`
	SELECT id, gb_name, shorthand
	FROM mod_data
	`;

	return names;
}

export async function getModData(sql, modId) {
	if (!modId) {
		throw new Error('Getting mod data requires a mod ID');
	}

	const mod = (
		await sql`
		SELECT
			md.*,
			m.*,
			s.name AS side_name
		FROM mod_data md
		JOIN mods m
			ON md.id = m.mod_data_id
		JOIN sides s
			ON s.id = (
				SELECT side_id
				FROM tiers t
				WHERE t.id = m.tier_id
			)
		WHERE m.id = ${modId}
	`
	)[0];

	mod.submitter = (
		await sql`
		SELECT *
		FROM contributors
		WHERE id = ${mod.submitterId}
		`
	)[0];

	mod.credits = (
		await sql`
		SELECT json_agg(js) result
		FROM (
			SELECT json_build_object(
			'id', cg.id,
			'name', cg.name,
			'authors', array_agg(
				json_build_object(
					 'id', c.id,
					 'name', c.name,
					 'role_name', a.role_name
					 )
				)
			) js
			FROM credit_groups cg
			RIGHT JOIN authors a
				ON a.group_id = cg.id
			RIGHT JOIN contributors c
				ON c.id = a.contributor_id
			WHERE mod_data_id = ${mod.modDataId}
			GROUP BY cg.id
		) t
		`
	)[0].result;

	mod.children = await sql`
		SELECT id, gb_name
		FROM mod_data
		WHERE parent_id = ${mod.modDataId}
		ORDER BY gb_name ASC
		`;

	if (mod.children.length > 0) {
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
		SELECT *
		FROM download_links
		WHERE mod_data_id = ${mod.modDataId}
	`;
	}

	return mod;
}

export async function getClearedPlayers(sql, modId) {
	if (!modId) {
		throw new Error('Getting clears for a mod requires a mod ID');
	}

	const clearedPlayers = await sql`
		SELECT
			p.id, name, proof, is_local_proof, is_fc, cleared_date, is_private, public_notes, public_mod_notes
		FROM player_progress pp
		JOIN players p
			ON player_id = p.id
		WHERE
			mod_id = ${modId}
			AND cleared = true
		ORDER BY player_id ASC
	`;

	return clearedPlayers;
}
