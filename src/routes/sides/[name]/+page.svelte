<script>
	import { page } from '$app/state';

	let { data } = $props();

	function scroll(id) {
		const navbar = document.getElementById('navbar');
		const tier = document.getElementById(id);

		scrollTo({ top: tier.offsetTop - navbar.clientHeight });
	}

	$effect(() => {
		const sides = document.getElementById('side-cassette');
		sides.src = `/assets/navbar/cassettes/${page.params?.name}.png`;
	});
</script>

<svelte:head>
	<title>{data.side.name} - CSR</title>
</svelte:head>

<nav>
	<button onclick={() => (location = '#')}><h3>{data.side.name}</h3></button>
	{#each data.side.tiers as tier}
		<button
			style="color: #{tier.color};"
			onclick={() => {
				scroll(tier.name);
			}}>{tier.name}</button
		>
	{/each}
</nav>

<main>
	<div class="content">
		<h1 style="color: #{data.side.color ?? 'ffffff'};">
			{data.side.name}
			{#if data.player}
				{data.side.tiers
					.map((tier) => Number(tier.clears) ?? 0)
					.reduce((previous, current) => previous + current, 0)}/{data.side.tiers
					.map((tier) => tier.mods.length ?? 0)
					.reduce((previous, current) => previous + current, 0)}
			{/if}
			{#if data.side.clearsForRank}
				{#if data.side.clears >= data.side.clearsForRank}
					<small>(role achieved!)</small>
				{:else}
					<small>({data.side.clearsForRank ?? 0} needed for role)</small>
				{/if}
			{/if}
		</h1>
		{#each data.side.tiers as tier}
			<div id={tier.name} class="tier-name">
				{#if data.side.showTierNames}
					<h2 style="color: #{tier.colorPlus};">
						{tier.name}{#if data.player}:
							<small>{tier.clears ?? 0}/{tier.mods.filter((mod) => !mod.isChild).length}</small>
						{/if}

						{#if tier.clears >= tier.clearsForRank}
							<small>(role achieved!)</small>
						{:else}
							<small
								>({tier.clearsForRank}
								needed for role)</small
							>
						{/if}
					</h2>
				{/if}
			</div>
			{#each tier.mods as mod}
				<div class="mod-info">
					<div>
						<a
							id="mod"
							href="/mods/{mod.id}"
							style="text-decoration: none; color: #{tier.color ?? 'ffffff'};">{mod.name}</a
						>
						{#if mod.notes}
							<sup
								id="note-tag"
								onmouseenter={() => {
									note.textContent = mod.notes;
									note.showPopover();
								}}
								onmouseleave={() => note.hidePopover()}>notes</sup
							>
						{/if}
					</div>
				</div>
			{/each}
		{/each}
	</div>
</main>

<div role="note" popover="manual" id="note"></div>

<style>
	nav {
		display: grid;
		position: fixed;
		right: 10px;
		padding-right: 1rem;
		justify-items: center;

		> * {
			font-size: calc(100cqh / 100%);
		}
	}

	button {
		border-style: none;
		background-color: transparent;
	}

	main {
		display: grid;
		justify-content: center;
	}

	h1 {
		justify-self: center;
		font-size: 42px;
	}

	h3 {
		margin-bottom: 0;
	}

	.content {
		display: grid;
		gap: 2px;
		border: 2px solid pink;
		width: 80vw;
	}

	.tier-name {
		display: grid;
		font-size: 20px;
		justify-content: center;
	}

	.mod-info {
		display: grid;
		grid-auto-flow: column;
		margin: 5px 10px;
	}

	#note-tag:hover {
		anchor-name: --notes;
	}

	#note {
		position: fixed;
		margin: 0;

		position-anchor: --notes;
		position-area: right;

		position-try-fallbacks: top, bottom;

		&:popover-open {
			display: block;
			width: min(fit-content, max-width);
			max-width: 350px;
		}
	}
</style>
