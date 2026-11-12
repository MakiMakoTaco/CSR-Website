<script>
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { exportSide } from '$lib/functions/exportSide.js';

	let { data } = $props();

	function hoverColor(tier) {
		return tier.colorPlus === tier.color ? 'bfbfbf' : tier.colorPlus;
	}

	function lightDlc(color) {
		const [r, g, b] = [0, 2, 4].map((i) => parseInt((color ?? '000000').slice(i, i + 2), 16));
		return (r * 299 + g * 587 + b * 114) / 1000 > 210 ? 'light-dlc' : '';
	}

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
		<div class="loading">Loading...</div>
	{:then side}
		{#if side}
			<nav>
				<button onclick={() => (location = '#')}><h3>{side.name}</h3></button>
				{#await side.tiers then tiers}
					{#each tiers as tier}
						<button
							class="tier-link"
							style="color: #{tier.color}; --tier-color: #{tier.color}; --hover-color: #{hoverColor(
								tier
							)};"
							onclick={() => {
								scroll(tier.name);
							}}>{tier.name.replace(/^Catstare: /, '')}</button
						>
					{/each}
				{/await}
			</nav>
			<div class="content">
				<button class="export" onclick={() => exportSide(side, data.player?.name)}>Export</button>
				<h1
					class={lightDlc(side.color)}
					style="--dlc-color: #{side.color}; color: {side.color ? `#${side.color}` : 'CanvasText'};"
				>
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
										{tier.name.replace(/^Catstare: /, '')}{#if data.player}:
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
												style="text-decoration: none; color: #{tier.color ??
													'ffffff'}; --hover-color: #{hoverColor(tier)};">{mod.name}</a
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
											<span class="download"
												><a href={mod.download} style="--hover-color: #{hoverColor(tier)};"
													>Download</a
												></span
											>
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
												style="text-decoration: none; color: #{tier.color ??
													'ffffff'}; --hover-color: #{hoverColor(tier)};">{mod.name}</a
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
											<span class="download"
												><a href={mod.download} style="--hover-color: #{hoverColor(tier)};"
													>Download</a
												></span
											>
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
		margin-top: 1rem;
		padding: 0.5rem;
		border: 1px solid grey;
		border-radius: 1rem;
		background-color: Canvas;

		justify-self: right;
		justify-items: center;

		> * {
			padding: 4px;
			font-size: 14px;
			cursor: pointer;
		}

		@media (width < 1000px) {
			top: 3px;
			left: 126px;
			right: 3px;
			margin: 0;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: baseline;
			padding: 2px;
			border-radius: 0.5rem;

			> * {
				padding: 1px 2px;
				font-size: 13px;

				@media (width < 380px) {
					padding: 1px;
					font-size: 11px;
				}
			}

			h3 {
				font-size: 14px;

				@media (width < 380px) {
					font-size: 12px;
				}
			}
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

	.loading {
		width: fit-content;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		border: 1px solid grey;
		border-radius: 1rem;
	}

	h1 {
		grid-row: 1;
		grid-column: 1;
		justify-self: center;
		font-size: 42px;
	}

	h3 {
		margin-top: 0;
		margin-bottom: 0;
	}

	.content {
		display: grid;
		gap: 1rem;
		width: 80vw;

		@media (width < 1000px) {
			width: 95vw;
		}
	}

	.export {
		all: revert;
		width: fit-content;
		grid-row: 1;
		grid-column: 1;
		justify-self: end;
		align-self: end;
		margin-right: 20px;
		margin-bottom: -0.75rem;
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
		nav button:not(.export),
		.tier:not(.catstare-tier) h2,
		.tier:not(.catstare-tier) #mod,
		.mod-container #mod,
		.tier:not(.catstare-tier) .download a,
		.mod-container .download a {
			color: color-mix(in srgb, var(--tier-color) 70%, black) !important;
		}

		nav .tier-link:hover,
		.tier:not(.catstare-tier) #mod:hover,
		.mod-container #mod:hover,
		.tier:not(.catstare-tier) .download a:hover,
		.mod-container .download a:hover {
			color: color-mix(in srgb, var(--hover-color) 70%, black) !important;
		}

		.tier:not(.catstare-tier) {
			border-color: color-mix(in srgb, var(--tier-color) 70%, black);
		}
	}

	nav .tier-link:hover,
	#mod:hover {
		color: var(--hover-color) !important;
	}

	.tier-name {
		display: grid;
		font-size: 20px;
		justify-content: center;

		@media (width < 1000px) {
			text-align: center;

			h2 small:last-child {
				display: block;
			}
		}
	}

	.mod-info {
		padding: 0.5rem;
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: repeat(3, 1fr);

		@media (width < 1000px) {
			grid-template-columns: minmax(0, 1fr) auto 4.5em;
			column-gap: 0.75rem;
		}

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

		&:has(.cleared) .download {
			@media (width < 1000px) {
				align-self: center;
			}
		}

		.clears {
			grid-column: 3;

			display: grid;
			grid-template-columns: repeat(2, 1fr);

			@media (width < 1000px) {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				column-gap: 0.5em;
			}
		}
	}

	.clear-count {
		justify-self: end;

		@media (width < 1000px) {
			flex: 1;
			text-align: center;
		}
	}

	.cleared {
		color: #3bb143;
		grid-column: 2;
		justify-self: end;
	}

	:global(:root:not([data-theme='dark'])) .light-dlc {
		color: color-mix(in srgb, var(--dlc-color) 90%, black) !important;
	}

	.catstare nav,
	.catstare .side,
	.catstare .tier {
		color-scheme: dark;
		background-color: Canvas;
		color: CanvasText;
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
