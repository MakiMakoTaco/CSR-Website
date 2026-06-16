<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.side.name} - CSR</title>
</svelte:head>
<div>
	<h1>{data.side.name}</h1>
	{#each data.side.tiers as tier}
		<div>
			<h2 style="color: {tier.color_plus ?? black};">
				{tier.name}: <small>0/{tier.mods.length} ({tier.clears_for_rank} needed for role)</small>
			</h2>
		</div>
		{#each tier.mods as mod}
			<p>
				<a href="/mods/{mod.id}" style="text-decoration: none; color: {tier.color ?? grey};"
					>{mod.name}</a
				>
			</p>
		{/each}
	{/each}
</div>
