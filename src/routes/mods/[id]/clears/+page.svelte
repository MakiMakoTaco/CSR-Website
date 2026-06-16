<script>
	let { data = $bindable() } = $props();

	function updatePlayerSort(players) {
		const playerSort = data.players.sort((a, b) => b.is_video - a.is_video);

		return playerSort;
	}
</script>

<button onclick={updatePlayerSort(data.players)}>Button</button>
{#key data.players}
	{#each data.players as player}
		{#if player.id < 15}
			<p>{player.name}: {player.is_video}</p>
		{/if}
	{/each}
{/key}

<table>
	<thead>
		<tr>
			<th>Player Name</th>
			<th>Proof</th>
			<th>FC?</th>
			<th>Player Notes</th>
			<th>Mod Notes</th>
		</tr>
	</thead>
	<tbody>
		{#each data.players as player}
			<tr>
				<td>{player.name}</td>
				<td
					><a href={player.proof} target="_blank">
						{#if player.is_video}
							Video
						{:else}
							Screenshot
						{/if}
					</a></td
				>
				<td>{player.is_fc}</td>
				<td>{player.public_notes}</td>
				<td>{player.mod_notes}</td>
			</tr>
		{/each}
	</tbody>
</table>
