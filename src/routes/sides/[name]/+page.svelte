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
				{tier.name}:
				<small
					>{tier.clears}/{tier.mods.filter((mod) => !mod.is_child).length} ({tier.clears_for_rank} needed
					for role)</small
				>
			</h2>
		</div>
		{#each tier.mods as mod}
			{#if !mod.is_child}
				<p>
					<a href="/mods/{mod.id}" style="text-decoration: none; color: {tier.color ?? grey};"
						>{mod.name}</a
					>
				</p>
			{/if}
		{/each}
	{/each}
</div>
