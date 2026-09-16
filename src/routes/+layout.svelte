<script>
	let { data, children } = $props();

	function postitionDropdown(id) {
		const anchor = event.currentTarget;
		const menu = document.getElementById(id);

		if (!menu) return;

		requestAnimationFrame(() => {
			menu.style.left = `${anchor.offsetLeft + anchor.offsetWidth / 2 - menu.offsetWidth / 2}px`;
			menu.style.top = `${anchor.offsetTop + anchor.offsetHeight}px`;
		});
	}
</script>

<nav id="navbar">
	<ul class="nav-left">
		<li><a href="/">Home</a></li>
		<li>
			<button
				onmouseenter={() => {
					postitionDropdown('sides');
					sides.showPopover();
				}}
				onmouseleave={() => {
					if (event.relatedTarget !== sides) {
						sides.hidePopover();
					}
				}}>Sides</button
			>
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
				href="https://docs.google.com/spreadsheets/d/1XTAL3kgpX0bG6SBfznPX8z7Qdb7lGnQRuxeUfPZMFoU/edit?gid=0#gid=0"
				target="_blank">CSR Spreadsheet</a
			>
		</li>
		<li><a href="https://discord.gg/rVYhpeRX2u" target="_blank">Discord Server</a></li>
	</ul>
	<ul class="nav-right">
		<li>
			<a href="/submit">Submit Maps</a>
		</li>
		{#if data?.player?.name}
			{#if data.player.role}
				<li>
					<a href="/admin">Admin Panel</a>
				</li>
			{/if}
			{console.log(data.player)}
			{#if !data.player.claimed}
				<li><a href="/claim-player">Claim Player</a></li>
			{/if}
			<li>
				<a href="/profile">
					<img src={data.player.avatar} alt="profile" class="profile-pic-nav" /><span
						style="color: {`#${data.player.nameColor}` ?? 'white'};">{data.player.name}</span
					>
				</a>
			</li>
		{:else}
			<li><a href="/login">Login</a></li>
		{/if}
		<!-- check if player is logged in -->
		<!-- check if logged in player has admin permissions -->
		<!-- if player is not logged in -->
	</ul>
</nav>

<div
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
</div>

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
				style="color: #{new TextEncoder().encode(side.color_plus)};">{side.name}</a
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
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		overflow: hidden;
		position: sticky;
		top: 0%;
		background-color: #333;
	}

	ul {
		display: grid;
		grid-auto-flow: column;
		text-align: center;
		justify-self: center;
		align-items: center;
	}

	li {
		list-style: none;
		margin: 0% 10px;
	}

	a {
		text-decoration: none;
		color: cyan;
	}

	.dropdown-menu {
		inset: 0;
		margin: 0;
		justify-items: center;

		&:popover-open {
			display: grid;
		}
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
</style>
