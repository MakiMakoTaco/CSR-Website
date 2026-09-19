<script>
	let { data } = $props();
	let mod = $derived(data.mod);
</script>

<main>
	<div>
		<h1>{mod.name}</h1>
	</div>
</main>
