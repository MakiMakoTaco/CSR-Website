<script>
	let { data } = $props();
	let side = $state('A-Side');
</script>

<select
	bind:value={side}
	onclick={() => {
		// Get data for side
	}}
>
	{#each data.sideNames as side}
		<option>{side.name}</option>
	{/each}
</select>
