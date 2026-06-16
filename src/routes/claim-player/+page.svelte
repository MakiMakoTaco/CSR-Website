<script>
	function filterPlayers(filter) {
		return (players = data.playerList.filter((p) => {
			const name = filter.toLowerCase();
			const returnedFilter = p.name.toLowerCase().includes(name) || p.id.toString().includes(name);

			return returnedFilter;
		}));
	}

	let { data } = $props();
	let searchFilter = $state('');
	let players = $derived(data.playerList);
</script>

<div>
	<h2>
		Please ping or dm @hyrulemaki or a CSR mod on Discord with the player name along with the
		corresponding ID
	</h2>
</div>

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
		</p>
	{/each}
</div>
