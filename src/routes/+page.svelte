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
		<h3>
			The site's now live! There are so many things I've either forgotten about or planning to work
			on so. Please feel free to contact hyrulemaki or a moderator in the Discord server about any
			questions or feedback
		</h3>
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
		<div class="questions">
			<div class="submissions">
				<h1>Submissions</h1>
				<p>
					To submit your clears, submit the proof of the map(s) to the google form. Journal
					screenshots (uploaded to websites like imgur or catbox.moe) are most common and always
					accepted.
				</p>
				<p>
					If your submission is not formatted correctly, or if it is a submission for the DLC tabs,
					it will have to be manually reviewed by a moderator of the sheet, which can take some
					time.
				</p>
				<p>
					Note, resubmitting will likely not make this faster. Be sure to format your submissions
					properly, and be patient!
				</p>
				<p>
					Common formatting mistakes include spelling mistakes of the map in question, and inputting
					a tier without its letter, like "Gold" instead of "Gold A", "Bronze SuperSide" instead of
					"Bronze Super". (The quotes are just for separation here and should not be used in
					submissions.)
				</p>
				<p>
					Additionally, right now, server roles are not automated; mods will apply them as they come
					up. If one ends up being missed after some time, ping a mod!
				</p>
				<p>
					If you are totally new to Celeste, you can download the mod loader here:
					https://everestapi.github.io/
				</p>
				<p>
					The Shrimp sheet is a collection of maps that did not make it onto the main CSR sheet.
					Check it out here:
					https://docs.google.com/spreadsheets/d/1ljc0gVIURrKP3qtStGnrcuBCSOE5P_R8jZZz7VQwN8U
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
					A. The "sides" of the sheet correspond to the year those mods were released in. B-Side for
					2022, C-Side for 2023, and so on. DLCs are from the current year, and the Catstare sheet
					contains the GM+ maps.
				</p>
				<h4>Q. What counts as a clear?</h4>
				<p>
					A1. A clear is a clear, within reason. You can use savestates or toy with variants to
					practice a room, but you must eventually clear all rooms, front to back, properly. Clears
					of any date are also accepted!
				</p>
				<h4>
					A2. You do not have to full clear maps unless it is listed as mandatory. (You still should
					try, though!)
				</h4>
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
