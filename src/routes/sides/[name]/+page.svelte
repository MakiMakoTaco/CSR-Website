<script>
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { data } = $props();

	function scroll(id) {
		const navbar = document.getElementById('navbar');
		const tier = document.getElementById(id);

		scrollTo({ top: tier.offsetTop - navbar.clientHeight });
	}

	onMount(() => {
		document.addEventListener('scroll', (e) => {
			note.hidePopover();
		});
	});

	// $effect(() => {
	// 	const sides = document.getElementById('side-cassette');
	// 	sides.src = `/assets/navbar/cassettes/${page.params?.name}.png`;
	// });
</script>

<svelte:head>
	{#await data.side}
		<title>Loading Side...</title>
	{:then side}
		{#if side}
			<title>{side.name} - CSR</title>
		{:else}
			<title>Side Not Found</title>
		{/if}
	{/await}
</svelte:head>

<main>
	{#await data.side}
		Loading side data...
	{:then side}
		{#if side}
			<div class="content">
				<nav>
					<button onclick={() => (location = '#')}><h3>{side.name}</h3></button>
					{#await side.tiers then tiers}
						{#each tiers as tier}
							<button
								style="color: #{tier.color};"
								onclick={() => {
									scroll(tier.name);
								}}>{tier.name}</button
							>
						{/each}
					{/await}
				</nav>
				<h1 style="color: #{side.color ?? 'ffffff'};">
					<div style="text-align: center;">{side.name}</div>
					<div style="text-align: center;">
						{#if data.player}
							{side.tiers
								.map((tier) => tier.mods.filter((mod) => mod.cleared).length ?? 0)
								.reduce((previous, current) => previous + current, 0)}/
						{/if}{side.tiers
							.map((tier) => tier.mods.length ?? 0)
							.reduce((previous, current) => previous + current, 0)} mods
						{#if side.clearsForRank}
							{#if side?.clears >= side.clearsForRank}
								<small>(role achieved!)</small>
							{:else}
								<small>({side.clearsForRank ?? 0} needed for role)</small>
							{/if}
						{/if}
					</div>
				</h1>
				{#each side.tiers as tier}
					<div id={tier.name} class="tier-name">
						{#if side.showTierNames}
							<h2 style="color: #{tier.colorPlus};">
								{tier.name}
								{#if data.player}:
									<small
										>{tier.mods.filter((mod) => mod.cleared).length ?? 0}/{tier.mods.filter(
											(mod) => !mod.isChild
										).length}</small
									>
								{/if}

								{#if tier.clears && tier.clears.length >= tier.clearsForRank}
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
								{#if mod.cleared}
									<span style="color: green;">Cleared!</span>
								{/if}
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
		{:else}
			No side found
		{/if}
	{/await}
</main>

<div role="note" popover="manual" id="note" style="white-space: pre-wrap;"></div>

<style>
	nav {
		display: grid;
		position: fixed;
		padding-right: 1rem;

		justify-self: right;
		justify-items: center;

		> * {
			padding: 4px;
			font-size: 14px;
			cursor: pointer;
		}

		@media (width < 1000px) {
			display: none;
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
