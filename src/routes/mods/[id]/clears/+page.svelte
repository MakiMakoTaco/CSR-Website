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

<button class="back" onclick={() => (location = './')}>Return to Mod</button>
<div class="clears">
	{#if playerSubmission}
		<div class="player-submission">
			<h2>Your submission:</h2>
			{#if playerSubmission.proof}
				{#each playerSubmission.proof as proof, index}
					<a href={proof.link} target="_blank">
						{proof.type}{playerSubmission.proof.length > 1 ? ` ${index + 1}` : ''}
					</a>
				{/each}
			{:else}
				<span class="no-submission">None (for now!)</span>
			{/if}
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
					<td class="proof">
						{#each player.proof as proof, index}
							<a href={proof.link} target="_blank">
								{proof.type}{player.proof.length > 1 ? ` ${index + 1}` : ''}
							</a>
						{/each}
					</td>
					<td>{player.is_fc}</td>
					<td>{player.public_notes}</td>
					<td>{player.mod_notes}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	a:is(:link, :visited) {
		color: light-dark(#0000ee, #9e9eff);
	}

	a:hover {
		color: color-mix(in srgb, light-dark(#0000ee, #9e9eff) 50%, CanvasText);
	}

	.back {
		margin: 1rem 15px;
		padding: 4px 10px;
		font-size: 16px;
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

		.no-submission {
			font-size: 1.5em;
		}

		a {
			position: relative;
			top: -0.16em;
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

	.proof {
		display: grid;
		grid-template-columns: repeat(auto-fit, 1fr);
		gap: 1rem;
	}
</style>
