<script>
	import { page } from '$app/state';

	let { data } = $props();
	let side = $derived(data.side);

	function scroll(id) {
		const navbar = document.getElementById('navbar');
		const tier = document.getElementById(id);

		scrollTo({ top: tier.offsetTop - navbar.clientHeight });
	}
</script>

<svelte:head>
	<title>{side.name} - CSR</title>
</svelte:head>

<main>
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
				{#await side.tiers then tiers}
					{#if data.player}
						{tiers
							.map((tier) => tier.mods.length ?? 0)
							.reduce((previous, current) => previous + current, 0)} mods
					{/if}
					{#if side.clearsForRank}
						<small>({side.clearsForRank ?? 0} needed for role)</small>
					{/if}
				{/await}
			</div>
		</h1>
		{#await side.tiers then tiers}
			{#each tiers as tier}
				<div id={tier.name} class="tier-name">
					{#if data.side.showTierNames}
						<h2 style="color: #{tier.colorPlus};">
							{tier.name}{#if data.player}:
								<small>{tier.clears ?? 0}/{tier.mods.filter((mod) => !mod.isChild).length}</small>
							{/if}

							{#if tier.clears >= tier.clearsForRank}
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
				{#each tier.mods as tierMod}
					{#await tierMod.data}
						Loading mod data...
					{:then mod}
						{#if mod.id === 251}
							{console.log(mod)}
						{/if}
						<div class="mod-info">
							<div id="{mod.id}-mod-data">
								<div>
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
									<button
										onclick={(e) => {
											e.preventDefault();
											const data = document.getElementById(`${mod.id}-mod-data`);
											const edit = document.getElementById(`${mod.id}-mod-edit`);

											data.hidden = true;
											edit.hidden = false;
										}}>Edit</button
									>
									<!-- <button>Replace</button>
									<button>Remove</button> -->
								</div>
							</div>
							<div id="{mod.id}-mod-edit" hidden>
								<form method="POST" action="?/updateMod" onsubmit={(e) => e.requestSubmit()}>
									<input type="number" name="id" value={mod.id} hidden />
									<input id="{mod.id}-name" type="text" name="name" value={mod.name} />
									<textarea name="notes" value={mod.notes ?? ''} id="{mod.id}-notes"></textarea>
									<button
										onclick={(e) => {
											e.preventDefault();
											const data = document.getElementById(`${mod.id}-mod-data`);
											const edit = document.getElementById(`${mod.id}-mod-edit`);
											const name = document.getElementById(`${mod.id}-name`);

											data.hidden = false;
											edit.hidden = true;
											name.value = mod.name;
										}}>Cancel</button
									>
									<button>Save</button>
								</form>
							</div>
						</div>
					{/await}
				{/each}
			{/each}
		{/await}
	</div>
</main>

<div role="note" popover="manual" id="note"></div>

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
