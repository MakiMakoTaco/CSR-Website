<script>
	import { page } from '$app/state';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.playerName}'s proof for {data.modName} - CSR</title>
</svelte:head>

<button class="back" onclick={() => (location = `/mods/${page.params.modId}`)}>Return to Mod</button
>
<button class="back return" onclick={() => (location = `/players/${page.params.playerId}`)}
	>Return to Player</button
>

<main>
	<div class="content">
		<h1>
			<a href="/players/{page.params.playerId}">{data.playerName}</a>'s proof for
			<a href="/mods/{page.params.modId}">{data.modName}</a>
		</h1>

		{#if data.imageUrls.length > 0}
			<div class="images">
				{#each data.imageUrls as url}
					<a href={url} target="_blank">
						<img src={url} alt="player proof" />
					</a>
				{/each}
			</div>
			<p class="hint">Click an image to view it full size</p>
		{:else if data.proofLink}
			<p class="empty">
				This clear uses a link as proof: <a href={data.proofLink}>{data.proofLink}</a>
			</p>
		{:else}
			<p class="empty">Player does not have any images uploaded</p>
		{/if}
	</div>
</main>

<style>
	a:is(:link, :visited) {
		color: light-dark(#0000ee, #9e9eff);
	}

	a:hover {
		color: color-mix(in srgb, light-dark(#0000ee, #9e9eff) 50%, CanvasText);
	}

	.back {
		margin: 1rem 15px;
		padding: 4px 10px;
		font-size: 16px;
	}

	.return {
		float: right;
	}

	main {
		display: grid;
		justify-content: center;
	}

	.content {
		width: 80vw;
		margin-bottom: 1rem;
		border: 1px solid grey;
		border-radius: 1rem;

		@media (width < 1000px) {
			width: 95vw;
		}

		h1 {
			margin: 0;
			padding: 0.75rem 1rem;
			font-size: 24px;
			text-align: center;
			overflow-wrap: anywhere;
			border-bottom: 1px solid color-mix(in srgb, grey 60%, transparent);
		}
	}

	.images {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		padding: 1rem;

		a {
			width: min(480px, 100%);
		}

		img {
			display: block;
			width: 100%;
			border-radius: 0.5rem;
		}
	}

	.hint,
	.empty {
		margin: 0;
		padding: 0 1rem 1rem;
		text-align: center;
		overflow-wrap: anywhere;
	}

	.hint {
		font-size: 14px;
		color: grey;
	}

	.empty {
		padding-top: 1rem;
	}
</style>
