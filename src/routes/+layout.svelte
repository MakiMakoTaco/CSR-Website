<script>
	import { page } from '$app/state';

	let { data, children } = $props();

	function postitionDropdown(id) {
		const anchor = event.currentTarget;
		const menu = document.getElementById(id);

		if (!menu) return;

		requestAnimationFrame(() => {
			menu.style.left = `${anchor.offsetLeft + anchor.offsetWidth / 2 - menu.offsetWidth / 2}px`;
			menu.style.top = `${anchor.offsetTop + anchor.offsetHeight + 15}px`;
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
</script>

<nav id="navbar">
	<ul class="nav-left">
		<li><a href="/">Home</a></li>
		<li id="sides-dropdown">
			<button popovertarget="sides-menu" class="sides-dropdown" tabindex="0" href="/">Sides</button>
			<!-- <img
				id="side-cassette"
				class="cassette"
				alt="cassette tape"
				onerror={() => (this.src = '/assets/navbar/cassettes/default.png')}
				style="visibility: {page.url.pathname.startsWith('/sides') ? 'visible' : 'hidden'};"
			/> -->
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
	</ul>
	<ul class="nav-center">
		<li>
			<a
				href="https://docs.google.com/spreadsheets/d/1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU/edit?usp=sharing"
				target="_blank">CSR Spreadsheet</a
			>
		</li>
		<li><a href="https://discord.gg/rVYhpeRX2u" target="_blank">Discord Server</a></li>
	</ul>
	<ul class="nav-right">
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

<div popover id="sides-menu" class="sides-menu">
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
</div>

<!-- <div
	popover
	id="sides"
	class="dropdown-menu sides-dropdown"
	role="menu"
	tabindex="0"
	onmouseleave={() => sides.hidePopover()}
>
	{#each data.sides.filter((side) => side.type === 'standard') as side}
		<li class="dropdown-items">
			<a href="/sides/{side.name}">{side.name}</a>
		</li>
	{/each}
</div> -->

<div
	popover
	id="dlc"
	class="dropdown-menu"
	role="menu"
	tabindex="0"
	onmouseleave={() => dlc.hidePopover()}
>
	{#each data.sides.filter((side) => side.type === 'dlc' && !side.archived) as side}
		<li class="dropdown-items">
			<a
				href="/sides/{side.name}"
				onclick={dlc.togglePopover()}
				style="color: #{new TextEncoder().encode(side.colorPlus)};">{side.name}</a
			>
		</li>
	{/each}
</div>

<div
	popover
	id="archived"
	class="dropdown-menu"
	role="menu"
	tabindex="0"
	onmouseleave={() => archived.hidePopover()}
>
	<div class="side-container">
		{#each data.sides.filter((side) => side.type === 'dlc' && side.archived) as side}
			<li class="dropdown-items">
				<a href="/sides/{side.name}" onclick={archived.togglePopover()}>{side.name}</a>
			</li>
		{/each}
	</div>
</div>

{@render children()}

<style>
	nav {
		inset: 0;
		padding: 15px 0;
		border-color: Canvas;
		border-style: solid;
		border-top-width: 1rem;

		position: sticky;

		display: grid;
		grid-auto-flow: column;

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

		&:has(a:hover)::after {
			top: anchor(top);
			left: anchor(left);
			right: anchor(right);
			bottom: anchor(bottom);
		}

		> ul {
			display: flex;
			padding: 0;
			margin: 0;
			justify-self: center;
			align-items: center;
		}

		li {
			list-style: none;

			> a:focus-visible,
			> a:hover {
				anchor-name: --hovered-link;
			}
		}

		a {
			display: block;
			padding: 1rem;
		}
	}

	a {
		text-decoration: none;
		color: blueviolet;
	}

	.nav-left {
		justify-self: left;
		margin-left: 2.7vw;
	}

	.nav-right {
		justify-self: right;
		margin-right: 2.5vw;
	}

	.nav-right a img {
		margin-right: 10px;
	}

	.profile-pic-nav {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		vertical-align: middle;
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

	.sides-menu {
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
	}
</style>
