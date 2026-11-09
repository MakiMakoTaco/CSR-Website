<script>
	import { page } from '$app/state';

	let { data } = $props();

	let fullClears = $derived(data.clears.filter((clear) => clear.isFc).length);
	let timedClears = $derived(data.clears.filter((clear) => clear.timeTaken != null));
	let deathClears = $derived(data.clears.filter((clear) => clear.deaths != null));

	let search = $state('');
	let sort = $state('recent');

	let groups = $derived.by(() => {
		const terms = search.toLowerCase().trim();
		const clears = data.clears.filter(
			(clear) =>
				!terms ||
				[clear.name, clear.tierName, clear.sideName, clear.publicNotes]
					.join(' ')
					.toLowerCase()
					.includes(terms)
		);

		if (sort === 'recent') {
			return [{ clears }];
		}

		const sides = new Map();
		for (const clear of clears) {
			if (!sides.has(clear.sideId)) {
				sides.set(clear.sideId, { id: clear.sideId, name: clear.sideName, clears: [] });
			}
			sides.get(clear.sideId).clears.push(clear);
		}

		return [...sides.values()]
			.sort((a, b) => a.id - b.id)
			.map((side) => ({
				...side,
				clears: side.clears.sort(
					(a, b) => a.sideIndex - b.sideIndex || a.name.localeCompare(b.name)
				)
			}));
	});

	function hoverColor(clear) {
		return clear.tierColorPlus === clear.tierColor ? 'bfbfbf' : clear.tierColorPlus;
	}

	function formatTime(seconds) {
		const pad = (n) => String(n).padStart(2, '0');
		return `${Math.floor(seconds / 3600)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
	}
</script>

<title>
	{data.player.name} - Profile
</title>
<div class="player-header">
	{#if data.player.avatar}
		<img alt="player profile" src={data.player.avatar} />
	{/if}
	<h1 style="color: {`#${data.player.nameColor}` ?? 'CanvasText'};">
		{data.player.name}
	</h1>

	{#if data.player.about}
		<p>
			About me: {data.player.about}
		</p>
	{/if}
</div>

<div class="stats">
	{#if data.isOwner}
		<button class="edit-clears" onclick={() => (location = '/profile/edit-clears')}
			>Edit Clears</button
		>
	{/if}
	<h2>Total Clears: {data.clears.length}</h2>
	{#if !data.privateStats && (fullClears > 0 || timedClears.length > 0 || deathClears.length > 0)}
		<div class="totals">
			{#if fullClears > 0}
				<span>Full Clears: {fullClears}</span>
			{/if}
			{#if timedClears.length > 0}
				<span
					>Total Time: {formatTime(
						timedClears.reduce((total, clear) => total + clear.timeTaken, 0)
					)}</span
				>
			{/if}
			{#if deathClears.length > 0}
				<span>Total Deaths: {deathClears.reduce((total, clear) => total + clear.deaths, 0)}</span>
			{/if}
		</div>
	{/if}
	{#if data.roles.length > 0}
		<div class="roles">
			{#each data.roles as role}
				<div
					class="role {role.catstare ? 'catstare-role' : ''} {role.plus ? 'plus-role' : ''}"
					style="background-color: #{role.color};"
				>
					{role.name}
				</div>
			{/each}
		</div>
	{/if}
</div>

<div class="clears">
	{#if data.clears.length > 0}
		<h2>Clears</h2>
		<div class="controls">
			<input type="search" placeholder="Search clears" bind:value={search} />
			<span class="sort">
				<button
					class="sort-toggle"
					class:active={sort === 'recent'}
					onclick={() => (sort = 'recent')}>Most Recent</button
				>
				<button class="sort-toggle" class:active={sort === 'side'} onclick={() => (sort = 'side')}
					>By Side</button
				>
			</span>
		</div>
		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th class="mod-name">Mod Name</th>
						<th class="proof">Proof</th>
						{#if !data.privateStats}
							<th class="time">Time Taken</th>
							<th class="deaths">Deaths</th>
							<th class="full-clear">Full Clear</th>
						{/if}
						<th class="clear-date">Clear Date</th>
						{#if !data.privateStats}
							<th class="player-notes">Notes</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#if groups.every((group) => group.clears.length === 0)}
						<tr>
							<td class="no-results" colspan={data.privateStats ? 3 : 7}>No clears found</td>
						</tr>
					{/if}
					{#each groups as group}
						{#if group.name && group.clears.length > 0}
							<tr class="side-row">
								<th colspan={data.privateStats ? 3 : 7}>{group.name}</th>
							</tr>
						{/if}
						{#each group.clears as clear}
							<tr>
								<td class="mod-name">
									<a
										class="tier-mod {clear.tierName.startsWith('Catstare') ? 'catstare-mod' : ''}"
										href="/mods/{clear.modId}?player={page.params.playerId}"
										style="--tier-color: #{clear.tierColor}; --hover-color: #{hoverColor(clear)};"
										>{clear.name}</a
									>
									<span
										class="tier {clear.tierName.startsWith('Catstare') ? 'catstare-tier' : ''}"
										style="background-color: #{clear.tierColor};"
										>{clear.tierName.startsWith('Catstare') ? 'Catstare' : clear.tierName}</span
									>
								</td>
								<td class="proof"><a href={clear.proof}>Proof</a></td>
								{#if !data.privateStats}
									<td class="time"
										>{clear.timeTaken != null ? formatTime(clear.timeTaken) : 'N/A'}</td
									>
									<td class="deaths">{clear.deaths ?? 'N/A'}</td>
									<td class="full-clear">{clear.isFc ? 'Yes' : 'N/A'}</td>
								{/if}
								<td class="clear-date">
									{clear.clearedDate
										? new Date(clear.clearedDate).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												timeZone: 'UTC'
											})
										: 'N/A'}
								</td>
								{#if !data.privateStats}
									<td class="player-notes">{clear.publicNotes}</td>
								{/if}
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p>No Clears available</p>
	{/if}
</div>

<style>
	a:is(:link, :visited) {
		color: light-dark(#0000ee, #9e9eff);
	}

	a:hover {
		color: color-mix(in srgb, light-dark(#0000ee, #9e9eff) 50%, CanvasText);
	}

	.mod-name a {
		text-decoration: none;
	}

	.player-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0 1rem;

		img {
			border-radius: 50%;
		}

		p {
			flex-basis: 100%;
			text-align: center;

			overflow-wrap: break-word;
			word-break: break-word;
			white-space: pre-line;
		}
	}

	.edit-clears {
		position: absolute;
		right: 10px;
		bottom: calc(100% + 13px);

		@media (width < 1000px) {
			position: fixed;
			z-index: 1;
			top: 3px;
			right: 7px;
			bottom: auto;
			padding: 6px 7px 2px;
			font-size: 16px;
			color: blueviolet;
			border: 1px solid grey;
			border-radius: 0.5rem;
			background: Canvas;
		}
	}

	.stats {
		position: relative;
		width: 80vw;
		margin: 0 auto 1rem;
		padding: 0 1rem 1rem;
		box-sizing: border-box;
		border: 1px solid grey;
		border-radius: 1rem;
		text-align: center;

		@media (width < 1000px) {
			width: 95vw;
		}

		h2 {
			margin: 0.5rem 0;
			padding: 0.5rem;
		}
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem 2rem;
		margin-bottom: 1rem;
		font-size: 18px;
		font-weight: bold;
	}

	.roles {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.role {
		padding: 5px;
		color: black;
		border-radius: 20px;
	}

	.catstare-role {
		background-color: #3a3a3a !important;
		color: white;

		&.plus-role {
			background-color: black !important;
		}
	}

	.clears {
		width: 80vw;
		margin: 0 auto 1rem;
		border: 1px solid grey;
		border-radius: 1rem;

		@media (width < 1000px) {
			width: 95vw;
		}

		> h2,
		> p {
			margin: 0.5rem 0;
			padding: 0.5rem;
			text-align: center;
		}
	}

	.table-wrapper {
		overflow-x: auto;
		border-radius: 0 0 1rem 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;

		@media (width < 1000px) {
			font-size: 14px;
		}
	}

	tr {
		border-top: 1px solid grey;
	}

	th,
	td {
		padding: 0.5rem;
		text-align: center;
		overflow-wrap: break-word;

		@media (width < 1000px) {
			padding: 0.5rem 0.25rem;
		}
	}

	@media (width < 1000px) {
		th.mod-name {
			min-width: 120px;
		}

		th.player-notes {
			min-width: 160px;
			padding-left: 1.5rem;
		}

		td.player-notes {
			padding-left: 1.5rem;
		}
	}

	.tier {
		display: inline-block;
		margin-left: 0.4rem;
		padding: 1px 7px;
		font-size: 12px;
		color: black;
		border-radius: 20px;
		white-space: nowrap;
		vertical-align: 0.1em;

		@media (width < 1000px) {
			display: none;
		}
	}

	@media (width < 1000px) {
		.mod-name a.tier-mod {
			color: var(--tier-color);

			&:hover {
				color: var(--hover-color);
			}
		}

		:global(:root:not([data-theme='dark'])) .mod-name a.tier-mod:not(.catstare-mod) {
			color: color-mix(in srgb, var(--tier-color) 70%, black);

			&:hover {
				color: color-mix(in srgb, var(--hover-color) 70%, black);
			}
		}

		.mod-name a.tier-mod.catstare-mod {
			color: CanvasText;

			&:hover {
				color: grey;
			}
		}
	}

	.catstare-tier {
		background-color: #3a3a3a !important;
		color: white;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.5rem 1rem;
		padding: 0 1rem 1rem;

		input {
			width: min(300px, 100%);
			font-size: 16px;
		}
	}

	.sort-toggle {
		padding: 2px 7px;
	}

	.sort-toggle.active {
		background-color: light-dark(color-mix(in srgb, pink 50%, white), #5b2c6f);
		color: light-dark(black, white);
		border: 1px solid light-dark(#767676, #6b6b6b);
		border-radius: 3px;
	}

	:global(:root[data-theme='dark']) .sort-toggle.active {
		background-color: color-mix(in srgb, blueviolet 45%, black);
		color: white;
	}

	tr.side-row th {
		font-size: 18px;
		text-align: center;
	}

	tr td.no-results {
		text-align: center;
	}

	th:first-child,
	td:first-child {
		text-align: left;
		overflow-wrap: anywhere;
	}
</style>
