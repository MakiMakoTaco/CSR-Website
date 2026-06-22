<script>
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<ul class="nav-left">
		<li><a href="/">Home</a></li>
		<li class="dropdown">
			<a href="/sides" class="dropdown-toggle" data-toggle="dropdown"
				>Sides<span class="caret"></span></a
			>
			<ul class="dropdown-menu"></ul>
		</li>

		{#each data.sides.filter((side) => side.type === 'standard') as side}
			<li><a href="/sides/{side.name}">{side.name}</a></li>
		{/each}
		<li class="dropdown">
			<a href="/" class="dropdown-toggle" data-toggle="dropdown">DLC<span class="caret"></span></a>
			<ul class="dropdown-menu">
				<!-- dlc dropdown menu -->
			</ul>
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
		<li><a href="/claim-player">Claim Player</a></li>
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
					<img src={data.player.avatar} alt="profile" class="profile-pic-nav" />
					<span style="color: {data.player.nameColor ?? 'white'};">Player Portal</span>
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

{@render children()}

<!-- 

	table {
		width: 100%;
	}
		.dropdown-menu.show {
		display: block;
	}
	.dropdown-menu li a {
		display: block;
		padding: 8px 16px;
		color: #fff;
		text-decoration: none;
	}
	.dropdown-menu li a:hover {
		background: #444;
	} -->

<style>
	:root {
		color-scheme: light dark;
	}
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #333;
		padding: 10px;
	}
	nav ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		display: flex;
	}
	nav ul li {
		margin: 0 10px;
		align-content: center;
	}
	nav ul li a {
		color: white;
		text-decoration: none;
	}
	.nav-left {
		flex: 1;
	}
	.nav-right {
		flex: 1;
		justify-content: flex-end;
	}
	.nav-right a {
		display: flex;
		align-items: center;
	}
	.dropdown-menu {
		display: none;
		position: absolute;
		background: #222;
		min-width: 160px;
		z-index: 1000;
		list-style: none;
		padding: 0;
		margin: 0;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}
	.dropdown {
		position: relative;
	}
	.nav-right a img {
		margin-right: 10px; /* Adjust the spacing between the image and the text */
	}
	.profile-pic-nav {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		vertical-align: middle;
	}
</style>
