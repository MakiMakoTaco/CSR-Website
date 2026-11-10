<script>
	let { data } = $props();

	function nameOutline(color) {
		const [r, g, b] = [0, 2, 4].map((i) => parseInt((color ?? '000000').slice(i, i + 2), 16));
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;

		if (brightness < 55) return 'dark-name';
		if (brightness > 205) return 'light-name';
		return '';
	}
</script>

<svelte:head>
	<title>Celeste Skill Rating - Home</title>
	<meta
		name="description"
		content="Get better at Celeste by beating mods organised into difficulty tiers!"
	/>
	<meta name="keywords" content="CSR, Celeste, Skill, Rating, Progress, Improve" />
</svelte:head>

<main>
	<div class="title">
		<h1>Welcome to the Celeste Skill Rating!</h1>
		<h3>
			The site's now live! This means that the <a
				href="https://docs.google.com/spreadsheets/d/1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU/edit?usp=sharing"
				target="_blank">Google Sheets</a
			>
			is now legacy! There are so many things I've either forgotten about or planning to work on so. Please
			feel free to contact hyrulemaki or a moderator in the Discord server about any questions or feedback!
			If you're new to CSR, check out the <a href="/faq">FAQ page</a>!
		</h3>
	</div>
	<div class="sides-info sides-info-container">
		<table class="sides-info">
			<thead>
				<tr>
					<th scope="col">Side</th>
					<th scope="col">Total Clears</th>
					<th scope="col">Unique Players</th>
				</tr>
			</thead>
			<tbody>
				{#each data.sides as side}
					{#if side.type === 'standard'}
						<tr>
							<th scope="row"
								><a
									class={side.name === 'Super-Side' ? 'super-side' : 'standard-side'}
									href="/sides/{side.name}"
									style={side.name === 'Super-Side' ? 'color: blueviolet;' : ''}>{side.name}</a
								></th
							>
							<td>{side.clearCount}</td>
							<td>{side.uniquePlayers}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
			<thead><tr><th scope="col">Catstare & DLC</th><th></th><th></th></tr></thead>
			<tbody>
				{#each data.sides as side}
					{#if (side.type === 'catstare' || side.type === 'dlc') && !side.archived}
						<tr>
							<th scope="row"
								><a
									class={side.type === 'catstare' ? 'catstare-side' : 'dlc-side'}
									href="/sides/{side.name}"
									style="color: {side.type === 'catstare'
										? 'CanvasText'
										: `#${side.color}`}; --dlc-color: #{side.color}; --hover-color: #{side.colorPlus};"
									>{side.name}</a
								></th
							>
							<td>{side.clearCount}</td>
							<td>{side.uniquePlayers}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
			<thead><tr><th scope="col">Archived</th><th></th><th></th></tr></thead>
			<tbody>
				{#each data.sides as side}
					{#if side.archived}
						<tr>
							<th scope="row"
								><a
									class="dlc-side"
									href="/sides/{side.name}"
									style="color: #{side.color}; --dlc-color: #{side.color}; --hover-color: #{side.colorPlus};"
									>{side.name}</a
								></th
							>
							<td>{side.clearCount}</td>
							<td>{side.uniquePlayers}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
	<div>
		<div class="submissions">
			<h2>Recent Submissions</h2>
			<div class="submission-table-container">
				<table class="submission-table">
					<thead>
						<tr>
							<th align="left" scope="col">Submission</th>
							<th scope="col">Player</th>
							<th scope="col">Tier</th>
						</tr>
					</thead>
					<tbody>
						{#await data.recentSubmissions}
							<tr><td>Loading Submissions...</td></tr>
						{:then recentSubmissions}
							{#each recentSubmissions as submission}
								<tr>
									<td align="left"><a href="/mods/{submission.mod.id}">{submission.mod.name}</a></td
									>
									<td
										><a
											class="player {nameOutline(submission.player.color)}"
											style="color: #{submission.player.color}; --player-color: #{submission.player
												.color || '000000'};"
											href="/players/{submission.player.id}">{submission.player.name}</a
										></td
									>
									<td
										><div
											class="tier {submission.mod.tierName.startsWith('Catstare')
												? 'catstare-tier'
												: ''}"
											style="background-color: #{submission.mod.tierColor};"
										>
											{submission.mod.tierName}
										</div></td
									>
								</tr>
							{/each}
						{/await}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		margin: 10px 50px;
		display: grid;
		grid: auto-flow / 1.5fr 1fr;
		gap: 10px;

		@media (width < 1130px) {
			margin: 10px 15px;
			grid-template-columns: 1fr;
		}
	}

	table a:is(:link, :visited) {
		color: light-dark(#0000ee, #9e9eff);
	}

	.super-side:hover {
		color: plum !important;
	}

	.standard-side:hover {
		color: color-mix(in srgb, light-dark(#0000ee, #9e9eff) 50%, CanvasText);
	}

	.catstare-side:hover {
		color: grey !important;
	}

	.dlc-side:hover {
		color: var(--hover-color) !important;
	}

	:global(:root:not([data-theme='dark'])) .dlc-side {
		color: color-mix(in srgb, var(--dlc-color) 70%, black) !important;

		&:hover {
			color: color-mix(in srgb, var(--hover-color) 70%, black) !important;
		}
	}

	div {
		text-align: center;
	}

	.title {
		@media (width >= 1130px) {
			grid-column: span 2;
		}
	}

	.sides-info {
		table-layout: fixed;
		width: 100%;
		margin: 10px auto;
		border-collapse: collapse;
		text-align: center;
	}

	.sides-info-container {
		align-self: start;
		border: 1px solid grey;
		border-radius: 1rem;
	}

	.sides-info tr {
		border-top: 1px solid grey;
	}

	.sides-info thead:first-child tr {
		border-top: 0;
	}

	thead {
		font-size: 20px;
	}

	th,
	td {
		padding: 0.5em;

		@media (width < 1130px) {
			padding: 0.3em;
		}
	}

	.submission-table-container {
		padding: 0.75rem 1rem;
		border: 2px solid CanvasText;
		border-radius: 20px;

		@media (width < 1130px) {
			padding: 0.5rem;
		}
	}

	.submission-table {
		width: 100%;
		background-color: 040406;
		border-collapse: collapse;
		border-radius: 10px;

		tr:first-child th {
			border-top: 0;
		}

		tr:last-child td {
			border-bottom: 0;
		}
		th,
		td {
			width: fit-content;
			font-size: medium;
			justify-self: center;

			border: 0 solid grey;
			border-width: 1px 0;
		}

		a {
			text-decoration: none;

			&:hover {
				color: color-mix(in srgb, light-dark(#0000ee, #9e9eff) 50%, CanvasText);
			}
		}

		.player:hover {
			color: color-mix(in srgb, var(--player-color) 50%, grey) !important;
		}

		.player,
		.tier {
			width: fit-content;
			margin: auto;
			padding: 5px;
			color: black;
			border-radius: 20px;
		}

		.catstare-tier {
			background-color: black !important;
			color: white;
		}
	}

	:global(:root[data-theme='dark']) .dark-name {
		text-shadow:
			0 0 1px lightgrey,
			0 0 1px lightgrey,
			0 0 1px lightgrey,
			0 0 1px lightgrey,
			0 0 1px lightgrey,
			0 0 1px lightgrey,
			0 0 1px lightgrey,
			0 0 1px lightgrey;
	}

	:global(:root:not([data-theme='dark'])) .light-name {
		text-shadow:
			0 0 1px dimgrey,
			0 0 1px dimgrey,
			0 0 1px dimgrey,
			0 0 1px dimgrey,
			0 0 1px dimgrey,
			0 0 1px dimgrey,
			0 0 1px dimgrey,
			0 0 1px dimgrey;
	}

	/* .questions {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(2, 50%);

		* {
			text-align: left;
		}
	} */

	.submissions {
		margin: auto;
		max-width: 75%;
	}

	.submissions:has(.submission-table) {
		@media (width < 1130px) {
			max-width: 100%;
		}
	}
</style>
