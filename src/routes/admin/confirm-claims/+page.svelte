<script>
	let { data } = $props();

	let pending = $state(false);
	let confirmedPlayer = $state();
</script>

{#if !data.pendingPlayers || data.pendingPlayers.length < 1}
	No players to confirm
{:else}
	{#each data.pendingPlayers as player}
		<div class="claim">
			<div class="current-player">
				Discord ID: {player.current.discordId}
			</div>
			<div class="new-player">
				Name: {player.requested.name}
			</div>

			<button
				disabled={confirmedPlayer?.current.discordId === player.current.discordId}
				onclick={async () => {
					try {
						confirmedPlayer = player;
						pending = true;

						const response = await fetch('/admin/confirm-claims', {
							method: 'POST',
							body: JSON.stringify({ current: player.current, requested: player.requested })
						});
					} catch (error) {
						console.log(error);
					}
				}}>Confirm Player</button
			>
		</div>
	{/each}
{/if}

<style>
	.claim {
		display: grid;
		justify-items: center;
		gap: 0.5rem;
		width: min(500px, 90vw);
		margin: 1rem auto;
		padding: 1rem;
		box-sizing: border-box;
		border: 1px solid grey;
		border-radius: 1rem;
		text-align: center;
		overflow-wrap: anywhere;

		button {
			margin-top: 0.25rem;
			padding: 4px 10px;
			font-size: 16px;
		}
	}
</style>
