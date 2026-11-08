<script>
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { data } = $props();

	function scroll(id) {
		const navbar = document.getElementById('navbar');
		const tier = document.getElementById(id);

		scrollTo({ top: tier.offsetTop - navbar.offsetHeight - 1 });
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

<main class={page.params.name === 'Catstare' ? 'catstare' : ''}>
	{#await data.side}
		Loading side data...
	{:then side}
		{#if side}
			<nav>
				<button onclick={() => (location = '#')}><h3>{side.name}</h3></button>
				{#await side.tiers then tiers}
					{#each tiers as tier}
						<button
							style="color: #{tier.color}; --tier-color: #{tier.color};"
							onclick={() => {
								scroll(tier.name);
							}}>{tier.name}</button
						>
					{/each}
				{/await}
			</nav>
			<div class="content">
				<h1 style="color: #{side.color};">
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
				{#if side.showTierNames}
					{#each side.tiers as tier}
						<div
							class="tier {tier.name === 'Catstare' ? 'catstare-tier' : ''}"
							style="--tier-color: #{tier.color}; --hover-color: #{tier.colorPlus}"
						>
							<div id={tier.name} class="tier-name">
								{#if side.showTierNames}
									<h2 style="color: #{tier.color};">
										{tier.name}{#if data.player}:
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
							<div class="mods">
								{#each tier.mods as mod}
									<div class="mod-info">
										<div>
											<a
												id="mod"
												href="/mods/{mod.id}"
												style="text-decoration: none; color: #{tier.color ?? 'ffffff'};"
												>{mod.name}</a
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

										{#if mod.download}
											<span class="download"><a href={mod.download}>Download</a></span>
										{/if}

										<div class="clears">
											<span class="clear-count">{mod.clears}</span>
											{#if mod.cleared}
												<span class="cleared">Cleared!</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				{:else}
					<div class="side" style="--side-color: #{side.color};">
						{#each side.tiers as tier}
							<div
								id={tier.name}
								class="mod-container"
								style="--tier-color: #{tier.color}; --hover-color: #{tier.colorPlus};"
							>
								{#each tier.mods as mod}
									<div class="mod-info">
										<div>
											<a
												id="mod"
												href="/mods/{mod.id}"
												style="text-decoration: none; color: #{tier.color ?? 'ffffff'};"
												>{mod.name}</a
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

										{#if mod.download}
											<span class="download"><a href={mod.download}>Download</a></span>
										{/if}

										<div class="clears">
											<span class="clear-count">{mod.clears}</span>
											{#if mod.cleared}
												<span class="cleared">Cleared!</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			No side found
		{/if}
	{/await}
</main>

<div role="note" popover="manual" id="note" style="white-space: pre-wrap;"></div>

<style>
	nav {
		right: 1rem;
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
		gap: 1rem;
		width: 80vw;
	}

	.side {
		margin: 10px;
		border: 1px solid var(--side-color);
		border-radius: 1rem;

		.mod-container:first-child .mod-info:first-child {
			border-top: 0;
		}
	}

	.tier {
		margin: 10px;
		border: 1px solid var(--tier-color);
		border-radius: 1rem;
	}

	.catstare-tier {
		background-color: black;
		color: white;
	}

	:global(:root:not([data-theme='dark'])) main:not(.catstare) {
		nav button,
		.tier:not(.catstare-tier) h2,
		.tier:not(.catstare-tier) #mod,
		.mod-container #mod,
		.tier:not(.catstare-tier) .download a,
		.mod-container .download a {
			color: color-mix(in srgb, var(--tier-color) 70%, black) !important;
		}

		.tier:not(.catstare-tier) .download a:hover,
		.mod-container .download a:hover {
			color: color-mix(in srgb, var(--hover-color) 70%, black) !important;
		}

		.tier:not(.catstare-tier) {
			border-color: color-mix(in srgb, var(--tier-color) 70%, black);
		}
	}

	.tier-name {
		display: grid;
		font-size: 20px;
		justify-content: center;
	}

	.mod-info {
		padding: 0.5rem;
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: repeat(3, 1fr);

		border: 1px solid grey;
		border-left: 0;
		border-right: 0;
		border-bottom: 0;

		.download {
			justify-self: center;
			grid-column: 2;

			a {
				color: var(--tier-color);
				text-decoration: none;

				&:hover {
					color: var(--hover-color);
				}
			}
		}

		.clears {
			grid-column: 3;

			display: grid;
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.clear-count {
		justify-self: end;
	}

	.cleared {
		color: #3bb143;
		grid-column: 2;
		justify-self: end;
	}

	:global(:root:has(main.catstare)) {
		color-scheme: dark;
	}

	.catstare #note-tag {
		color: lightgrey;
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
