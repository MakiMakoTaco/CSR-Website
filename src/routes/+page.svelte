<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Celeste Skill Rating - Home</title>
	<meta
		name="description"
		content="Get better at Celeste by beating mods organised into difficulty tiers"
	/>
	<meta name="keywords" content="CSR, Celeste, Skill, Rating, Progress, Improve" />
</svelte:head>

<main>
	<div class="title">
		<h1>Welcome to the Celeste Skill Rating!</h1>
		<p>
			This site is still being tested, if you want to actually submit, please continue using the <a
				href="https://docs.google.com/spreadsheets/d/1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU/edit?usp=sharing"
				>Google sheet</a
			> for now
		</p>
	</div>
	<div class="sides-info">
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
							<th scope="row"><a href="/sides/{side.name}">{side.name}</a></th>
							<td>{side.clearCount}</td>
							<td>{side.uniquePlayers}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
			<thead><tr><th colspan="3">DLC & Catstare</th></tr></thead>
			<tbody>
				{#each data.sides as side}
					{#if (side.type === 'catstare' || side.type === 'dlc') && !side.archived}
						<tr>
							<th scope="row"><a href="/sides/{side.name}">{side.name}</a></th>
							<td>{side.clearCount}</td>
							<td>{side.uniquePlayers}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
			<thead><tr><th colspan="3">Archived</th></tr></thead>
			<tbody>
				{#each data.sides as side}
					{#if side.archived}
						<tr>
							<th scope="row"><a href="/sides/{side.name}">{side.name}</a></th>
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
						{#each data.recentSubmissions as submission}
							<tr>
								<td align="left"><a href="/mods/{submission.mod.id}">{submission.mod.name}</a></td>
								<td
									><a
										class="player"
										style="color: #{submission.player.color};"
										href="/players/{submission.player.id}">{submission.player.name}</a
									></td
								>
								<td
									><div class="tier" style="background-color: #{submission.mod.tierColor};">
										{submission.mod.tierName}
									</div></td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<div class="what-is">
			<h2>What is CSR?</h2>
			<p>
				CSR is a list of Celeste maps, collabs and contests that you can play through at your own
				pace, & feel a sense of accomplishment once you beat them! Have you just started playing and
				want to see how far you can get? Or are you a veteran celeste player and want to show off?
				There's something for every player in CSR!
			</p>
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
			grid-template-columns: 1fr;
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
		padding: 1rem;
		border: 2px solid white;
		border-radius: 20px;
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
		}

		.player,
		.tier {
			width: fit-content;
			margin: auto;
			padding: 5px;
			color: black;
			border-radius: 20px;
		}

		.player {
			background-color: grey;
		}
	}
</style>
