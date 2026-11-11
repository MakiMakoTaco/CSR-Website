<script>
	import { page, updated } from '$app/state';
	import { onMount } from 'svelte';

	let { data, children } = $props();

	let lightMode = $state(true);

	let searchFilter = $state('');
	let players = $state([]);
	let sides = $state([]);
	let tiers = $state([]);
	let mods = $state([]);

	let searchResults = $derived.by(() => {
		if (!players || players.length === 0 || !sides || sides.length === 0) {
			return {
				players: players.length > 0 ? players : [],
				sides: sides.length > 0 ? sides : []
			};
		}

		const filter = searchFilter.toLowerCase().trim();
		if (!filter || filter === '') return { players, sides };

		return {
			players: players.filter((player) => player.name.toLowerCase().includes(filter)),
			sides: sides
				.filter(
					(side) =>
						side.name.toLowerCase().includes(filter) ||
						side.tiers.filter(
							(tier) =>
								tier.name.toLowerCase().includes(filter) ||
								tier.mods.filter((mod) => mod.name.toLowerCase().includes(filter)).length > 0
						).length > 0
				)
				.map((side) => {
					return {
						...side,
						tiers: side.tiers
							.map((tier) => {
								return {
									...tier,
									mods: tier.mods.filter((mod) => mod.name.toLowerCase().includes(filter))
								};
							})
							.filter((tier) => {
								if (
									tier.mods.some((mod) => mod.name.toLowerCase().includes(filter)) ||
									tier.name.toLowerCase().includes(filter)
								) {
									return true;
								} else {
									return false;
								}
							})
					};
				})
		};
	});

	function toggleLightMode() {
		lightMode = !lightMode;
		document.documentElement.dataset.theme = lightMode ? 'light' : 'dark';
		localStorage.setItem('theme', lightMode ? 'light' : 'dark');
	}

	function lightDlc(color) {
		const [r, g, b] = [0, 2, 4].map((i) => parseInt((color ?? '000000').slice(i, i + 2), 16));
		return (r * 299 + g * 587 + b * 114) / 1000 > 210 ? 'light-dlc' : '';
	}

	function postitionDropdown(id) {
		const anchor = event.currentTarget;
		const menu = document.getElementById(id);

		if (!menu) return;

		requestAnimationFrame(() => {
			menu.style.left = `${anchor.offsetLeft + (anchor.offsetWidth - menu.clientWidth + menu.clientLeft / 2) / 2}px`;
			menu.style.top = `${anchor.offsetTop + anchor.offsetHeight + anchor.clientHeight - menu.clientTop}px`;
		});
	}

	function updateSideStats(side) {
		const name = document.getElementById('name');
		const clears = document.getElementById('clears');
		const players = document.getElementById('players');

		name.textContent = `${side.name}`;
		clears.textContent = `Clears: ${side.clearCount}`;
		players.textContent = `Unique Players: ${side.uniquePlayers}`;
	}

	function flipDropdown(id) {
		document.getElementById(id).hidden = !document.getElementById(id).hidden;
	}

	onMount(() => {
		lightMode = document.documentElement.dataset.theme !== 'dark';

		document.addEventListener('touchstart', (e) => {
			if (!sidebar.contains(e.target)) {
				if (sidebar.style.width && sidebar.style.width == '250px') {
					e.preventDefault();
					sidebar.style.width = '';
				}
			}
		});

		const navLinks = document.getElementsByClassName('nav-link');

		for (const link of navLinks) {
			link.addEventListener('click', () => {
				sidebar.style.width = '';

				const dropdowns = sidebar.getElementsByClassName('dropdown-menu');
				for (const dropdown of dropdowns) {
					dropdown.hidden = true;
				}
			});
		}

		search.addEventListener('click', (e) => {
			if (e.target === search) {
				search.close();
			}
		});
	});

	$effect(async () => {
		players = await data.search.players;
		sides = await Promise.all(
			data.sides.map(async (side) => ({
				...side,
				tiers: (await data.search.tiers).filter((tier) => tier.sideId === side.id)
			}))
		);

		search.querySelectorAll('a').forEach((link) => {
			link.addEventListener('click', (e) => {
				search.close();
			});
		});
	});
</script>

<div class="app" data-sveltekit-reload={updated.current ? '' : 'off'}>
	<nav id="navbar" class="nav navbar">
		<ul class="nav-left">
			<li><a href="/">Home</a></li>
			<li><a href="/faq">FAQ</a></li>
			<li>
				<button class="sides" popovertarget="sides">Sides</button>
			</li>
			<!-- <li id="sides-dropdown">
			<button popovertarget="sides-menu" class="sides-dropdown" tabindex="0" href="/">Sides</button> -->
			<!-- <img
					id="side-cassette"
					class="cassette"
					alt="cassette tape"
					onerror={() => (this.src = '/assets/navbar/cassettes/default.png')}
					style="visibility: {page.url.pathname.startsWith('/sides') ? 'visible' : 'hidden'};"
				/> -->
			<!-- </li> -->
			<li>
				<a href="/sides/Catstare">Catstare</a>
			</li>
			{#if data.sides.filter((side) => side.type === 'dlc' && side.archived).length > 0}
				<li>
					<button class="dlc" popovertarget="dlc">Active DLC</button>
				</li>
			{/if}
			<li>
				<button class="archived" popovertarget="archived">Archived</button>
			</li>
		</ul>
		<ul class="nav-center">
			<li><a href="https://discord.gg/rVYhpeRX2u" target="_blank">Discord Server</a></li>
		</ul>
		<ul class="nav-right">
			<li>
				<button onclick={toggleLightMode}>{lightMode ? 'Dark Mode' : 'Light Mode'}</button>
			</li>
			<li>
				<button
					onclick={() => {
						searchFilter = '';
						search.showModal();
					}}>Search</button
				>
			</li>
			<li>
				<a class="submit" href="/submit">Submit Mods</a>
			</li>
			{#if data?.player?.name}
				{#if data.player.role}
					<li>
						<a href="/admin">Admin Panel</a>
					</li>
				{/if}
				{#if !data.player.claimed}
					<li><a href="/claim-player">Claim Player</a></li>
				{/if}
				<li>
					<a href="/profile" style="color: #{data.player.nameColor};">
						<img src={data.player.avatar} alt="profile" class="profile-pic-nav" /><span
							>{data.player.name}</span
						>
					</a>
				</li>
			{:else}
				<li><a href="/login">Login</a></li>
			{/if}
		</ul>
	</nav>

	<!-- <div popover id="sides-menu" class="sides-menu">
	<img class="background" src="/assets/navbar/sides/card.png" alt="sides-background" />
	<div class="content">
		<div id="summary" class="summary">
			<p id="clears">
				Clears: {data.sides.filter((side) => side.type === 'standard')[0].clearCount}
			</p>
			<p id="players">
				Unique Players: {data.sides.filter((side) => side.type === 'standard')[0].uniquePlayers}
			</p>
		</div>
		<h1 id="name" class="side-name">{data.sides[0].name}</h1>
	</div>
	<div class="side-names">
		{#each data.sides.filter((side) => side.type === 'standard') as side}
			<a
				class="tab"
				href="/sides/{side.name}"
				onfocus={() => updateSideStats(side)}
				onmouseenter={() => updateSideStats(side)}
			>
				<img src="/assets/navbar/sides/tab.png" alt="tab" />
				<p>
					{side.name}
				</p>
			</a>
		{/each}
	</div>
</div> -->

	<div popover id="sides" class="sides-dropdown" role="menu" tabindex="0">
		{#each data.sides.filter((side) => side.type === 'standard') as side}
			<li class="dropdown-items">
				<a href="/sides/{side.name}" onclick={() => sides.togglePopover()}>{side.name}</a>
			</li>
		{/each}
	</div>

	<div popover id="dlc" class="dlc-dropdown" role="menu" tabindex="0">
		{#each data.sides.filter((side) => side.type === 'dlc' && !side.archived) as side}
			<li class="dropdown-items">
				<a
					class={lightDlc(side.color)}
					href="/sides/{side.name}"
					onclick={() => dlc.togglePopover()}
					style="--hover-color: #{side.colorPlus}; --dlc-color: #{side.color}; color: #{side.color};"
					>{side.name}</a
				>
			</li>
		{/each}
	</div>

	<div popover id="archived" class="archived-dropdown" role="menu" tabindex="0">
		<div class="side-container">
			{#each data.sides.filter((side) => side.type === 'dlc' && side.archived) as side}
				<li class="dropdown-items">
					<a
						class={lightDlc(side.color)}
						href="/sides/{side.name}"
						onclick={archived.togglePopover()}
						style="--hover-color: #{side.colorPlus}; --dlc-color: #{side.color}; color: #{side.color};"
						>{side.name}</a
					>
				</li>
			{/each}
		</div>
	</div>

	<div id="sidebar-togge" class="nav sidebar">
		<button
			class="hamburger-menu"
			aria-label="show nav menu"
			onclick={() => (sidebar.style.width = '250px')}
			ontouchstart={() => (sidebar.style.width = '250px')}
		>
			Open Sidebar
		</button>
	</div>

	<div id="sidebar" class="nav-sidebar">
		<div
			class="close-sidebar"
			tabindex="0"
			role="button"
			onclick={() => (sidebar.style.width = '')}
			onkeypress={() => (sidebar.style.width = '')}
		>
			Close Sidebar
		</div>
		<a class="nav-link" href="/">Home</a>
		<a class="nav-link" href="/faq">FAQ</a>
		<div
			class="dropdown-toggle"
			tabindex="0"
			role="button"
			onclick={() => flipDropdown('sides-dropdown-test')}
			onkeypress={() => flipDropdown('sides-dropdown-test')}
		>
			Sides
		</div>
		<div id="sides-dropdown-test" class="sides dropdown-menu" role="menu" tabindex="0" hidden>
			{#each data.sides.filter((side) => side.type === 'standard') as side}
				<a class="nav-link" href="/sides/{side.name}">{side.name}</a>
			{/each}
		</div>
		<a class="nav-link" href="/sides/Catstare">Catstare</a>
		<div
			class="dropdown-toggle"
			tabindex="0"
			role="button"
			onclick={() => flipDropdown('dlc-dropdown-test')}
			onkeypress={() => flipDropdown('dlc-dropdown-test')}
		>
			DLC
		</div>
		<div id="dlc-dropdown-test" class="dlc dropdown-menu" role="menu" tabindex="0" hidden>
			{#each data.sides.filter((side) => side.type === 'dlc' && !side.archived) as side}
				<a class="nav-link" href="/sides/{side.name}">{side.name}</a>
			{/each}
		</div>
		<div
			class="dropdown-toggle"
			tabindex="0"
			role="button"
			onclick={() => flipDropdown('archived-dropdown-test')}
			onkeypress={() => flipDropdown('archived-dropdown-test')}
		>
			Archived
		</div>
		<div id="archived-dropdown-test" class="archived dropdown-menu" role="menu" tabindex="0" hidden>
			{#each data.sides.filter((side) => side.type === 'dlc' && side.archived) as side}
				<a class="nav-link" href="/sides/{side.name}">{side.name}</a>
			{/each}
		</div>
		<a class="nav-link" href="https://discord.gg/rVYhpeRX2u" target="_blank">Discord Server</a>
		<div
			class="theme-toggle"
			tabindex="0"
			role="button"
			onclick={toggleLightMode}
			onkeypress={toggleLightMode}
		>
			{lightMode ? 'Dark Mode' : 'Light Mode'}
		</div>
		<div
			class="search-toggle"
			tabindex="0"
			role="button"
			onclick={() => {
				searchFilter = '';
				search.showModal();
			}}
			onkeypress={() => {
				searchFilter = '';
				search.showModal();
			}}
		>
			Search
		</div>
		<a class="submit nav-link" href="/submit">Submit Mods</a>
		{#if data?.player?.name}
			{#if data.player.role}
				<a class="nav-link" href="/admin">Admin Panel</a>
			{/if}
			{#if !data.player.claimed}
				<a class="nav-link" href="/claim-player">Claim Player</a>
			{/if}
			<a class="nav-link" href="/profile" style="color: #{data.player.nameColor};">
				<img src={data.player.avatar} alt="profile" class="profile-pic-nav" /><span
					>{data.player.name}</span
				>
			</a>
		{:else}
			<a class="nav-link" href="/login">Login</a>
		{/if}
	</div>
	<!-- <div id="sidebar" class="nav-sidebar">
	<div>
		<li><a href="/">Home</a></li>
		<li id="sides-dropdown">
			<button>Sides</button>
			<div id="sides" class="dropdown-menu sides-dropdown" role="menu" tabindex="0" hidden>
				{#each data.sides.filter((side) => side.type === 'standard') as side}
					<li class="dropdown-items">
						<a href="/sides/{side.name}">{side.name}</a>
					</li>
				{/each}
			</div>
		</li>
		<li>
			<a href="/sides/Catstare">Catstare</a>
		</li>
		{#if data.sides.filter((side) => side.type === 'dlc' && side.archived).length > 0}
			<li>
				<button
					onmouseenter={() => {
						postitionDropdown('dlc');
						dlc.showPopover();
					}}
					onmouseleave={() => {
						if (event.relatedTarget !== dlc) {
							dlc.hidePopover();
						}
					}}>Active DLC</button
				>
			</li>
		{/if}
		<li>
			<button
				onmouseenter={() => {
					postitionDropdown('archived');
					archived.showPopover();
				}}
				onmouseleave={() => {
					if (event.relatedTarget !== archived) {
						archived.hidePopover();
					}
				}}>Archived</button
			>
		</li>
	</div>
	<div>
		<li>
			<a
				href="https://docs.google.com/spreadsheets/d/1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU/edit?usp=sharing"
				target="_blank">CSR Spreadsheet</a
			>
		</li>
		<li><a href="https://discord.gg/rVYhpeRX2u" target="_blank">Discord Server</a></li>
	</div>
	<div>
		<li>
			<a class="submit" href="/submit">Submit Mods</a>
		</li>
		{#if data?.player?.name}
			{#if data.player.role}
				<li>
					<a href="/admin">Admin Panel</a>
				</li>
			{/if}
			{#if !data.player.claimed}
				<li><a href="/claim-player">Claim Player</a></li>
			{/if}
			<li>
				<a href="/profile" style="color: #{data.player.nameColor};">
					<img src={data.player.avatar} alt="profile" class="profile-pic-nav" /><span
						>{data.player.name}</span
					>
				</a>
			</li>
		{:else}
			<li><a href="/login">Login</a></li>
		{/if}
	</div>
</div> -->
	<dialog id="search" class="search">
		<input type="text" bind:value={searchFilter} />
		<div class="results">
			<div class="player-search">
				{#await searchResults.players}
					<h3>Players:</h3>
					Loading Players...
				{:then players}
					{#if players?.length > 0}
						<h3>Players:</h3>

						{#each searchResults.players as player}
							<div>
								<a
									href="/players/{player.id}"
									style="--color: {player.nameColor ? `#${player.nameColor}` : 'Plum'} !important;"
									>{player.name}</a
								>
							</div>
						{/each}
					{/if}
				{/await}
			</div>
			<div class="side-search">
				{#await searchResults.sides}
					<h3>Sides:</h3>
					Loading Sides...
				{:then sides}
					{#if sides?.length > 0}
						<h3>Sides:</h3>

						{#each sides as side}
							<div>
								<a
									href="/sides/{side.name}"
									style={side.color
										? `--color: #${side.color}; --hover-color: #${side.colorPlus};`
										: ''}
									onclick={() => {
										search.close();
									}}>{side.name}</a
								>
							</div>
							<div class="tier-search">
								{#each side.tiers as tier}
									<div>
										<a
											href="/sides/{side.name}#{tier.name}"
											style={tier.color
												? `--color: #${tier.color}; --hover-color: #${tier.colorPlus};`
												: ''}
											onclick={() => {
												search.close();
											}}>{tier.name}</a
										>
									</div>
									<div class="mod-search">
										{#each tier.mods as mod}
											<div>
												<a
													href="/mods/{mod.id}"
													style={tier.color
														? `--color: #${tier.color}; --hover-color: #${tier.colorPlus};`
														: ''}
													onclick={() => {
														search.close();
													}}>{mod.name}</a
												>
											</div>
										{/each}
									</div>
								{/each}
								<br />
							</div>
						{/each}
					{/if}
				{/await}
			</div>
		</div>
	</dialog>

	{@render children()}
</div>

<style>
	:global(a) {
		text-decoration: none;
	}

	button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: blueviolet;
		font-size: medium;
		font-weight: 400;
	}

	.sides {
		anchor-name: --sides;
	}

	.dlc {
		anchor-name: --dlc;
	}

	.archived {
		anchor-name: --archived;
	}

	.sides-dropdown {
		position-anchor: --sides;
	}

	.dlc-dropdown {
		position-anchor: --dlc;
	}

	.archived-dropdown {
		position-anchor: --archived;
	}

	.sides-dropdown,
	.dlc-dropdown,
	.archived-dropdown {
		inset: auto;
		position: fixed;
		top: anchor(bottom);
		justify-self: anchor-center;

		border-color: violet;
		border-radius: 20px;

		a:hover {
			--hover-color: plum;
			color: var(--hover-color) !important;
		}

		li {
			padding: 0.3rem;
			text-align: center;
		}
	}

	.search {
		min-height: 5lh;
		max-height: 80%;
		max-width: 80vw;
		overflow-x: hidden;
		overscroll-behavior: contain;
		margin: auto;
		padding: 1rem;

		border: 0.5rem color-mix(in srgb, Canvas 10%, plum 70%) solid;
		border-radius: 1rem;

		&::backdrop {
			background-color: color-mix(in srgb, Canvas 40%);
		}

		input {
			display: block;
			width: fit-content;
			max-width: 80%;
			margin: 1rem auto;
			font-size: 26px;
		}

		a {
			--color: plum;
			--hover-color: color-mix(in srgb, var(--color) 90%, black);
			color: var(--color);

			&:hover {
				color: var(--hover-color);
			}
		}
	}

	.sidebar {
		display: none;
		width: fit-content;
		z-index: 1;
	}

	@media (width < 1000px) {
		.navbar {
			display: none;
		}

		.sidebar {
			display: grid;
		}
	}

	nav {
		inset: 0;
		padding: 15px 2.5vw 15px 2.7vw;
		border-color: Canvas;
		border-style: solid;
		border-top-width: 1rem;

		position: sticky;

		display: flex;
		justify-content: space-between;
		align-items: center;

		background: url(/assets/navbar/ticket.png);
		background-repeat: no-repeat;
		background-size: 110vw;
		background-position: center;

		isolation: isolate;
		z-index: 2;

		&::after {
			content: '';
			position: absolute;
			z-index: -1;

			top: calc(anchor(bottom) - 10px);
			left: calc(anchor(left) + 1rem);
			right: calc(anchor(right) + 1rem);
			bottom: calc(anchor(bottom) + 5px);

			background-image: url(/assets/navbar/goldenCard.png);
			background-repeat: no-repeat;
			background-size: 100vw;
			background-position: center;

			border-radius: 20px;

			position-anchor: --hovered-link;

			transition: inset 300ms;
		}

		&:has(a:hover, button:hover)::after {
			top: anchor(top);
			left: anchor(left);
			right: anchor(right);
			bottom: anchor(bottom);
		}

		> ul {
			display: contents;
		}

		li {
			list-style: none;

			&:hover {
				anchor-name: --hovered-link;
			}
		}

		a,
		button {
			display: block;
			padding: 1rem;
			font-family: Arial, Helvetica, sans-serif;
		}
	}

	a {
		text-decoration: none;
		color: blueviolet;
	}

	.nav-center li {
		margin: 0 1.5vw;
	}

	.nav-right a img {
		margin-right: 10px;
	}

	.sides-dropdown {
		anchor-name: --sides;
	}

	.dropdown-menu {
		inset: 0;
		margin: 0;
		justify-items: center;

		&:popover-open {
			display: grid;
		}
	}

	/* .sides-menu {
		border-style: none;
		position: fixed;

		padding-bottom: 10%;
		inset: auto;
		margin: 0;
		z-index: 2;

		&:popover-open {
			position-anchor: --sides;
			left: anchor(left);

			overflow: visible;

			display: grid;
			grid-template-areas: 'content' 'tabs';
			grid-template-rows: auto 0;
			justify-content: center;
		}

		> * {
			max-height: 50vh;
		}

		> :not(.side-names) {
			z-index: 1;
		}
	}

	.background {
		grid-area: content;
		justify-self: center;
		align-self: center;
	}

	.content {
		grid-area: content;
		display: grid;
		grid-template-rows: 4fr 1fr;
	}

	.summary {
		justify-self: center;
		align-self: center;
		text-align: center;

		> * {
			font-size: 30px;
			font-weight: bold;
			color: blueviolet;
		}
	}

	.side-name {
		justify-self: center;
		align-self: center;
		color: purple;
	}

	.side-names {
		--offset: 80px;

		grid-row: tabs;
		display: grid;
		grid-auto-flow: column;
		grid-template-rows: 0;
		justify-items: center;
	}

	.tab {
		display: grid;
		justify-items: center;
		align-items: center;

		position: relative;
		top: calc(0% - var(--offset));
		margin: 0 -50px;

		transition: all ease-in-out 500ms;

		&:focus-visible,
		&:hover {
			translate: 0 calc(var(--offset) / 2);
			scale: 120%;
			padding-bottom: 0;
			margin-top: 0;
			z-index: 2;
		}

		> * {
			grid-area: all;
			scale: 50%;
			font-size: 20px;
			font-weight: bold;
		}
	} */

	.profile-pic-nav {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		vertical-align: middle;
	}

	.nav {
		inset: 0;
		position: sticky;
		overflow-x: hidden;
	}

	.hamburger-menu {
		border: 1px solid grey;
		border-radius: 0.5rem;
		background: Canvas;
		justify-self: left;
		margin: 3px 0 0 7px;
		padding: 6px 7px 2px;
	}

	.nav-sidebar {
		height: 100%;
		width: 0;
		position: fixed;
		z-index: 1;
		top: 0;
		left: 0;
		overflow-x: hidden;
		background-color: Canvas;
		transition: 0.5s;
		overscroll-behavior: contain;

		a,
		.theme-toggle,
		.search-toggle {
			padding: 8px 8px 8px 32px;
			text-decoration: none;
			font-size: 25px;
			color: plum;
			display: block;
			transition: 0.3s;
		}

		.theme-toggle,
		.search-toggle {
			cursor: pointer;
		}

		.profile-pic-nav {
			width: 1em;
			height: 1em;
			margin-right: 0.3em;
			vertical-align: -0.1em;
		}

		.close-sidebar {
			padding: 10px 8px 8px 15px;
			color: blueviolet;
			cursor: pointer;
		}

		> * + * {
			border-top: 1px solid grey;
		}

		.dropdown-menu {
			border-top: 0;
			margin-left: 42px;
			justify-items: start;
		}

		.dropdown-toggle {
			padding: 8px 8px 8px 32px;
			font-size: 22px;
			color: color-mix(in srgb, plum 85%, black);
			cursor: pointer;

			&::after {
				content: '▾';
				margin-left: 6px;
				font-size: 16px;
			}
		}
	}
	:global(:root:not([data-theme='dark'])) .light-dlc:not(:hover) {
		color: color-mix(in srgb, var(--dlc-color) 90%, black) !important;
	}
</style>
