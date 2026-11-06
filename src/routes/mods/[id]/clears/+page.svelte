<script>
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let players = $state([...data.players]);
	let playerSubmission = $derived.by(() => {
		if (data.player) {
			const player = players.find((player) => player.id === data.player.id);

			return {
				...player,
				index: players.indexOf(player)
			};
		}
	});

	function updatePlayerSort() {
		// players = players.toSorted((a, b) => b.is_video - a.is_video);
		console.log(players);
		players = players.toSorted((a, b) => a.id > b.id);
	}
</script>

<a href="./">back to mod</a>
<br />

<button onclick={updatePlayerSort}>Button</button>
{#if playerSubmission}
	<div class="player-submission">
		<h2>Your submission:</h2>
		<a href={playerSubmission.proof}>{playerSubmission.proof}</a>
	</div>
{/if}
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
