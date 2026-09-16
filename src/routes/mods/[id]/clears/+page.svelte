<script>
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let players = $state([...data.players]);

	function updatePlayerSort() {
		players = players.toSorted((a, b) => b.is_video - a.is_video);
	}
</script>

<a href="./">back to mod</a>
<br />

<button onclick={updatePlayerSort}>Button</button>
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
		{#each players as player}
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
