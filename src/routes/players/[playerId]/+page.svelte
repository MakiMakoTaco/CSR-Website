<script>
	import { page } from '$app/state';

	let { data } = $props();

	let fullClears = $derived(data.clears.filter((clear) => clear.isFc).length);
	let timedClears = $derived(data.clears.filter((clear) => clear.timeTaken != null));
	let deathClears = $derived(data.clears.filter((clear) => clear.deaths != null));

	function formatTime(seconds) {
		const pad = (n) => String(n).padStart(2, '0');
		return `${Math.floor(seconds / 3600)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
	}
</script>

<title>
	{data.player.name} - Profile
</title>
<div class="player-header">
	{#if data.player.avatar}
		<img alt="player profile" src={data.player.avatar} />
	{/if}
	<h1 style="color: {data.player.nameColor ?? 'CanvasText'};">
		{data.player.name}
	</h1>

	{#if data.player.about}
		<p>
			About me: {data.player.about}
		</p>
	{/if}
</div>

<div class="stats">
	<h2>Total Clears: {data.clears.length}</h2>
	{#if !data.privateStats && (fullClears > 0 || timedClears.length > 0 || deathClears.length > 0)}
		<div class="totals">
			{#if fullClears > 0}
				<span>Full Clears: {fullClears}</span>
			{/if}
			{#if timedClears.length > 0}
				<span
					>Total Time: {formatTime(
						timedClears.reduce((total, clear) => total + clear.timeTaken, 0)
					)}</span
				>
			{/if}
			{#if deathClears.length > 0}
				<span>Total Deaths: {deathClears.reduce((total, clear) => total + clear.deaths, 0)}</span>
			{/if}
		</div>
	{/if}
	{#if data.roles.length > 0}
		<div class="roles">
			{#each data.roles as role}
				<div
					class="role {role.catstare ? 'catstare-role' : ''} {role.plus ? 'plus-role' : ''}"
					style="background-color: #{role.color};"
				>
					{role.name}
				</div>
			{/each}
		</div>
	{/if}
</div>

<div class="clears">
	{#if data.clears.length > 0}
		<h2>Clears</h2>
		<table>
			<thead>
				<tr>
					<th class="mod-name">Mod Name</th>
					<th class="proof">Proof</th>
					{#if !data.privateStats}
						<th class="time">Time Taken</th>
						<th class="deaths">Deaths</th>
						<th class="full-clear">Full Clear</th>
					{/if}
					<th class="clear-date">Clear Date</th>
					{#if !data.privateStats}
						<th class="player-notes">Notes</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each data.clears as clear}
					<tr>
						<td class="mod-name">
							<a href="/mods/{clear.modId}?player={page.params.playerId}">{clear.name}</a>
						</td>
						<td class="proof"><a href={clear.proof}>Proof</a></td>
						{#if !data.privateStats}
							<td class="time">{clear.timeTaken != null ? formatTime(clear.timeTaken) : 'N/A'}</td>
							<td class="deaths">{clear.deaths ?? 'N/A'}</td>
							<td class="full-clear">{clear.isFc ? 'Yes' : 'N/A'}</td>
						{/if}
						<td class="clear-date">
							{clear.clearedDate
								? new Date(clear.clearedDate).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										timeZone: 'UTC'
									})
								: 'N/A'}
						</td>
						{#if !data.privateStats}
							<td class="player-notes">{clear.publicNotes}</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No Clears available</p>
	{/if}
</div>

<style>
	a:is(:link, :visited) {
		color: light-dark(#0000ee, #9e9eff);
	}

	a:hover {
		color: color-mix(in srgb, light-dark(#0000ee, #9e9eff) 50%, CanvasText);
	}

	.mod-name a {
		text-decoration: none;
	}

	.player-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0 1rem;

		p {
			flex-basis: 100%;
			text-align: center;
		}
	}

	.stats {
		width: 80vw;
		margin: 0 auto 1rem;
		padding: 0 1rem 1rem;
		box-sizing: border-box;
		border: 1px solid grey;
		border-radius: 1rem;
		text-align: center;

		@media (width < 1000px) {
			width: 95vw;
		}

		h2 {
			margin: 0.5rem 0;
			padding: 0.5rem;
		}
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem 2rem;
		margin-bottom: 1rem;
		font-size: 18px;
		font-weight: bold;
	}

	.roles {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.role {
		padding: 5px;
		color: black;
		border-radius: 20px;
	}

	.catstare-role {
		background-color: #3a3a3a !important;
		color: white;

		&.plus-role {
			background-color: black !important;
		}
	}

	.clears {
		width: 80vw;
		margin: 0 auto 1rem;
		border: 1px solid grey;
		border-radius: 1rem;

		@media (width < 1000px) {
			width: 95vw;
		}

		> h2,
		> p {
			margin: 0.5rem 0;
			padding: 0.5rem;
			text-align: center;
		}
	}

	table {
		width: 100%;
		border-collapse: collapse;

		@media (width < 1000px) {
			font-size: 14px;
		}
	}

	tr {
		border-top: 1px solid grey;
	}

	th,
	td {
		padding: 0.5rem;
		text-align: center;
		overflow-wrap: break-word;

		@media (width < 1000px) {
			padding: 0.5rem 0.25rem;
		}
	}

	th:first-child,
	td:first-child {
		text-align: left;
		overflow-wrap: anywhere;
	}
</style>
