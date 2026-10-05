<script>
	let { data } = $props();
</script>

{#each data.sideNames as side}
	<div>
		<a href="/admin/edit-side/{side}">{side}</a>
	</div>
{/each}
