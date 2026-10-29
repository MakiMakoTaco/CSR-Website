<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Select Side - Edit</title>
</svelte:head>

{#each data.sideNames as side}
	<div>
		<a href="/admin/edit-side/{side}">{side}</a>
	</div>
{/each}
