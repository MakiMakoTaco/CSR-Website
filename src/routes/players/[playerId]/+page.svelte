<script>
	import { page } from '$app/state';

	let { data } = $props();
</script>

<title>
	{data.player.name} - Profile
</title>
<div class="player-header">
	{#if data.player.avatar}
		<img alt="player profile" src={data.player.avatar} />
	{/if}
	<h1 style="color: {data.player.nameColor ?? 'CanvasText'};">
		{data.player.name}
	</h1>

	{#if data.player.about}
		<p>
			About me: {data.player.about}
		</p>
	{/if}
</div>

<div class="clears">
	{#if data.clears.length > 0}
		<h2>Clears</h2>
		<table>
			<thead>
				<tr>
					<th class="mod-name">Mod Name</th>
					<th class="proof">Proof</th>
					<th class="time">Time Taken</th>
					<th class="deaths">Deaths</th>
					<th class="full-clear">Full Clear</th>
					<th class="clear-date">Clear Date</th>
					<th class="player-notes">Notes</th>
				</tr>
			</thead>
			<tbody>
				{#each data.clears as clear}
					<tr>
						<td class="mod-name">
							<a href="/mods/{clear.modId}?player={page.params.playerId}">{clear.name}</a>
						</td>
						<td class="proof"><a href={clear.proof}>Proof</a></td>
						<td class="time">{clear.timeTaken ?? 'N/A'}</td>
						<td class="deaths">{clear.deaths ?? 'N/A'}</td>
						<td class="full-clear">{clear.isFc}</td>
						<td class="clear-date">{clear.clearedDate ?? 'N/A'}</td>
						<td class="player-notes">{clear.publicNotes}</td>
					</tr>
				{/each}
			</tbody>
		</table>
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

		p {
			flex-basis: 100%;
			text-align: center;
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

	th:first-child,
	td:first-child {
		text-align: left;
		overflow-wrap: anywhere;
	}
</style>
