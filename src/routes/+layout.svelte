<script>
	let { data, children } = $props();

	function postitionDropdown(event, id) {
		const menu = document.getElementById(id);
		const button = event.currentTarget;

		if (!menu) return;

		requestAnimationFrame(() => {
			menu.style.left = `${button.offsetLeft + button.offsetWidth / 2 - menu.offsetWidth / 2}px`;
			menu.style.top = `${button.offsetTop + button.offsetHeight}px`;
		});
	}
</script>

<nav id="navbar">
	<ul class="nav-left">
		<li><a href="/">Home</a></li>
		<li>
			<button popovertarget="sides" onclick={(event) => postitionDropdown(event, 'sides')}
				>Sides</button
			>
		</li>
		<li>
			<a href="/sides/Catstare">Catstare</a>
		</li>
		{#if data.sides.filter((side) => side.type === 'dlc' && side.archived).length > 0}
			<li>
				<button popovertarget="dlc" onclick={(event) => postitionDropdown(event, 'dlc')}
					>Active DLC</button
				>
			</li>
		{/if}
		<li>
			<button popovertarget="archived" onclick={(event) => postitionDropdown(event, 'archived')}
				>Archived</button
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
		{#if data?.player?.name}
			{#if data.player.role}
				<li>
					<a href="/admin">Admin Panel</a>
				</li>
			{/if}
			<li>
				<a href="/submit">Submit Maps</a>
			</li>
			<li>
				<a href="/profile">
					<img src={data.player.avatar} alt="profile" class="profile-pic-nav" /><span
						style="color: {`#${data.player.nameColor}` ?? 'white'};">{data.player.name}</span
					>
				</a>
			</li>
		{:else}
			<li><a href="/claim-player">Claim Player</a></li>
			<li><a href="/login">Login</a></li>
		{/if}
		<!-- check if player is logged in -->
		<!-- check if logged in player has admin permissions -->
		<!-- if player is not logged in -->
	</ul>
</nav>

<div popover id="sides" class="dropdown-menu" role="menu">
	{#each data.sides.filter((side) => side.type === 'standard') as side}
		<li class="dropdown-items">
			<a href="/sides/{side.name}" onclick={() => sides.togglePopover()}>{side.name}</a>
		</li>
	{/each}
</div>

<div popover id="dlc" class="dropdown-menu" role="menu">
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

<div popover id="archived" class="dropdown-menu" role="menu">
	{#each data.sides.filter((side) => side.type === 'dlc' && side.archived) as side}
		<li class="dropdown-items">
			<a href="/sides/{side.name}" onclick={archived.togglePopover()}>{side.name}</a>
		</li>
	{/each}
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
		position: fixed;
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
