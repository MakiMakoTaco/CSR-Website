<script>
	let { data } = $props();

	let pending = $state(false);
	let confirmedPlayer = $state();
</script>

{#if !data.pendingPlayers || data.pendingPlayers.length < 1}
	No players to confirm
{:else}
	{#each data.pendingPlayers as player}
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
	{/each}
{/if}
