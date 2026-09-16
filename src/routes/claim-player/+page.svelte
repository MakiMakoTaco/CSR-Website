<script>
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';

	function filterPlayers(filter) {
		return (players = data.playerList.filter((p) => {
			const name = filter.toLowerCase();
			const returnedFilter = p.name.toLowerCase().includes(name) || p.id.toString().includes(name);

			return returnedFilter;
		}));
	}

	let { data, form } = $props();
	let searchFilter = $state('');
	let players = $derived(data.playerList);

	let selectedPlayer = $state({ name: '', id: 0 });
</script>

{#if form?.success}
	{redirect(302, '/profile')}
{/if}

<br />

<input
	bind:value={searchFilter}
	oninput={() => {
		filterPlayers(searchFilter);
	}}
/>

<div>
	{#each players as player}
		<p>
			{player.name} - ID: {player.id}
			<button
				onclick={() => {
					selectedPlayer = player;
					playerConfirm.showModal();
				}}>Claim</button
			>
		</p>
	{/each}
</div>

<form method="POST" action="?/claim">
	<input type="hidden" name="selected_player_id" bind:value={selectedPlayer.id} />
	<dialog id="playerConfirm" closedby="any">
		<div>
			Are you sure you want to claim the player {selectedPlayer.name} with ID of {selectedPlayer.id}
		</div>
		<button>Confirm</button>
	</dialog>
</form>

<style>
	dialog {
		&:open {
			display: grid;
			gap: 10px;
		}

		> button {
			justify-self: center;
			text-align: center;
			background-color: green;
			width: 6rem;
			height: 2.5rem;
			padding: 0.6em;
			border-radius: 20px;
			border-style: none;
		}
	}
</style>
