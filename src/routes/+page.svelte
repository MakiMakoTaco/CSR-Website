<script>
	let { data } = $props();

	function nameOutline(color) {
		const [r, g, b] = [0, 2, 4].map((i) => parseInt((color ?? '000000').slice(i, i + 2), 16));
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;

		if (brightness < 70) return 'dark-name';
		if (brightness > 190) return 'light-name';
		return '';
	}
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
		<h3>
			The site's now live! This means that the <a
				href="https://docs.google.com/spreadsheets/d/1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU/edit?usp=sharing"
				target="_blank">Google Sheets</a
			> is now legacy! There are so many things I've either forgotten about or planning to work on so.
			Please feel free to contact hyrulemaki or a moderator in the Discord server about any questions
			or feedback
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
							<th scope="row"
								><a href="/sides/{side.name}" style="color: #{side.colorPlus};">{side.name}</a></th
							>
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
							<th scope="row"
								><a href="/sides/{side.name}" style="color: #{side.colorPlus};">{side.name}</a></th
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
						{#each data.recentSubmissions as submission}
							<tr>
								<td align="left"><a href="/mods/{submission.mod.id}">{submission.mod.name}</a></td>
								<td
									><a
										class="player {nameOutline(submission.player.color)}"
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
		<div class="questions">
			<div class="submissions">
				<h1>Submissions</h1>
				<p>
					To submit your clears, just go to the submit page and select a mod. Journal screenshots
					(uploaded to websites like imgur or catbox.moe) are most common and always accepted,
					however there's also the option to upload directly or use another site!
				</p>
				<p>
					You might notice when submitting mods, that there's the option to submit for mods you've
					already beaten. This exists whilst a specific editing option gets worked on. Currently,
					sending a submission to the already beaten mod will just replace the proof attachment,
					along with setting an "update at" timestamp.
				</p>
				<p>
					If you encounter any issues when submitting please contact a mod or go to the Discord's
					help channel. If you receive a 4xx error, this will be fixed as soon as possible (we
					likely just forgot a line in the code.)
				</p>
				<p>
					If you receive a 500 error, then when you contact a mod, they may tell you to do something
					different in the meantime if you don't want to wait for a fix.
				</p>
				<p>
					When submitting multiple links as proof for a mod, please seperate them with a space. If
					you instead upload images directly, please make sure they are less than 4MB and that there
					are no more than 4 images per mod.
				</p>
				<p>
					If you are totally new to Celeste, you can download the mod loader <a
						href="https://everestapi.github.io/">here</a
					>
				</p>
				<p>
					The Shrimp sheet is a collection of maps that did not make it onto the main CSR sheet.
					<a
						href="https://docs.google.com/spreadsheets/d/1ljc0gVIURrKP3qtStGnrcuBCSOE5P_R8jZZz7VQwN8U"
						>Check it out here</a
					>
				</p>
			</div>
			<div class="start">
				<h1>Common Questions</h1>
				<h4>Q. Where should I start?</h4>
				<p>
					A. The Super-Side is a collection of 250 of the most polished mods from A-Side to E-Side;
					I highly recommend starting out there!
				</p>
				<h4>Q. What do the other sides mean?</h4>
				<p>
					A. The different sides under the "Sides" tab correspond to the year those mods were
					released in. B-Side for 2022, C-Side for 2023, and so on. DLCs are from the current year,
					and the Catstare sheet contains the GM+ maps.
				</p>
				<h4>Q. What counts as a clear?</h4>
				<p>
					A1. A clear is a clear, within reason. You can use savestates or toy with variants to
					practice a room, but you must eventually clear all rooms, front to back, properly. Clears
					of any date are also accepted!
				</p>
				<p>
					A2. You do not have to full clear maps unless it is listed as mandatory. (You still should
					try, though!)
				</p>
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
		padding: 1rem;
		border: 2px solid CanvasText;
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
	}

	:global(:root[data-theme='dark']) .dark-name {
		text-shadow:
			-0.5px -0.5px 0 lightgrey,
			0 -0.5px 0 lightgrey,
			0.5px -0.5px 0 lightgrey,
			-0.5px 0 0 lightgrey,
			0.5px 0 0 lightgrey,
			-0.5px 0.5px 0 lightgrey,
			0 0.5px 0 lightgrey,
			0.5px 0.5px 0 lightgrey;
	}

	:global(:root:not([data-theme='dark'])) .light-name {
		text-shadow:
			-0.5px -0.5px 0 dimgrey,
			0 -0.5px 0 dimgrey,
			0.5px -0.5px 0 dimgrey,
			-0.5px 0 0 dimgrey,
			0.5px 0 0 dimgrey,
			-0.5px 0.5px 0 dimgrey,
			0 0.5px 0 dimgrey,
			0.5px 0.5px 0 dimgrey;
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
	.start {
		margin: auto;
		max-width: 75%;
		text-align: left;
	}
</style>
