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

<main>
	{#if data.requestedPlayer}
		You've already requested a claim for the player {data.requestedPlayer.name}, please remind a
		moderator on the Discord to confirm this, or continue waiting.
	{:else if form?.success}
		<div class="success-message">
			<p>Player claim has been sent, feel free to notify a mod in the Discord server</p>
			<!-- , feel free to ping a mod with a screenshot of this page</p> -->
			<!-- <div class="player-info">
				Player with the discord ID of {data.player.discordId} wants to claim {selectedPlayer?.name}
			</div> -->
		</div>
	{:else if form?.error}
		<div class="error">
			<span>{form.error}</span>
			<p>Please contact a moderator on the Discord if someone has stolen your player</p>
		</div>
	{:else}
		<div class="claim-container">
			<input
				bind:value={searchFilter}
				oninput={() => {
					filterPlayers(searchFilter);
				}}
			/>

			<div class="player-list">
				{#each players as player}
					<span>{player.name} - ID: {player.id}</span>
					<button
						onclick={() => {
							selectedPlayer = player;
							playerConfirm.showModal();
						}}>Claim</button
					>
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
		</div>
	{/if}
</main>

<style>
	.claim-container {
		width: fit-content;
		margin: auto;
		display: grid;

		* {
			font-size: large;
			align-self: center;
		}

		input {
			margin: 1rem 0;
		}
	}

	.player-list {
		width: fit-content;
		margin: auto;

		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(2, max-content);
	}

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
