<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Welcome! - CSR</title>
</svelte:head>

<main>
	<div class="title">
		<h1>Welcome to the Celeste Skill Rating!</h1>
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
	<div class="what-is">
		<h2>What is CSR?</h2>
		<p>
			CSR is a list of Celeste maps, collabs and contests that you can play through at your own
			pace, & feel a sense of accomplishment once you beat them! Have you just started playing and
			want to see how far you can get? Or are you a veteran celeste player and want to show off?
			There's something for every player in CSR!
		</p>
	</div>
</main>

<style>
	main {
		display: grid;
		grid: auto-flow / repeat(2, 1fr);
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
		float: left;

		table-layout: fixed;
		width: 70vw;
		margin: 10px auto;
		border-collapse: collapse;
		text-align: center;

		@media (width < 1130px) {
			width: 100vw;
		}
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

	.what-is {
		width: 80%;
		justify-self: center;
	}
</style>
