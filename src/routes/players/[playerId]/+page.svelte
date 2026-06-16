<script>
	let { data } = $props();
</script>

<title>
	{data.player.name} - Profile
</title>
<div>
	{#if data.player.avatar}
		<img alt="player profile" src={data.player.avatar} />
	{/if}
	<h1 style="color: {data.player.name_color ?? 'black'};">
		{data.player.name}
	</h1>

	{#if data.player.about_me}
		<p>
			About me: {data.player.about_me}
		</p>
	{/if}
</div>

<div>
	{#if data.clears.length > 0}
		<h2>Clears:</h2>
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
						<td class="mod-name">{clear.name}</td>
						<td class="proof"><a href={clear.proof}>Proof</a></td>
						<td class="time">{clear.time_taken ?? 'N/A'}</td>
						<td class="deaths">{clear.deaths ?? 'N/A'}</td>
						<td class="full-clear">{clear.is_fc}</td>
						<td class="clear-date">{clear.cleared_date ?? 'N/A'}</td>
						<td class="player-notes">{clear.public_notes}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No Clears available</p>
	{/if}
</div>

<style>
	table {
		margin: auto;
	}
	th,
	td {
		padding-right: 25px;
	}
	td:not(.mod-name, .player-notes) {
		text-align: center;
	}
</style>
