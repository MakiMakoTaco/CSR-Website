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

<button class="back" onclick={() => (location = './')}>Back to Mod</button>
<div class="clears">
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
</div>

<style>
	.back {
		margin: 1rem 0;
	}

	.clears {
		width: 80vw;
		margin: 0 auto 1rem;
		border: 1px solid grey;
		border-radius: 1rem;

		@media (width < 1000px) {
			width: 95vw;
		}
	}

	.player-submission {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		gap: 0 1rem;
		padding: 0.5rem;
		overflow-wrap: anywhere;

		h2 {
			margin: 0.5rem 0;
		}
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	tr {
		border-top: 1px solid grey;
	}

	.clears > table:first-child thead tr {
		border-top: 0;
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
