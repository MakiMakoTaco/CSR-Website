<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let search = $state('');
	let sort = $state('recent');
	let editing = $state(null);

	let groups = $derived.by(() => {
		const terms = search.toLowerCase().trim();
		const clears = data.clears.filter(
			(clear) =>
				!terms ||
				[clear.name, clear.tierName, clear.sideName, clear.publicNotes]
					.join(' ')
					.toLowerCase()
					.includes(terms)
		);

		if (sort === 'recent') {
			return [{ clears }];
		}

		const sides = new Map();
		for (const clear of clears) {
			if (!sides.has(clear.sideId)) {
				sides.set(clear.sideId, { id: clear.sideId, name: clear.sideName, clears: [] });
			}
			sides.get(clear.sideId).clears.push(clear);
		}

		return [...sides.values()]
			.sort((a, b) => a.id - b.id)
			.map((side) => ({
				...side,
				clears: side.clears.sort(
					(a, b) => a.sideIndex - b.sideIndex || a.name.localeCompare(b.name)
				)
			}));
	});

	function hoverColor(clear) {
		return clear.tierColorPlus === clear.tierColor ? 'bfbfbf' : clear.tierColorPlus;
	}

	function formatDate(date) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC'
		});
	}
</script>

<svelte:head>
	<title>Edit Clears - CSR</title>
</svelte:head>

<button class="back" onclick={() => (location = `/players/${data.player.id}`)}
	>Return to Profile</button
>

<main>
	<div class="content">
		<h1>Edit Clears</h1>
		<div class="controls">
			<input type="search" placeholder="Search your clears" bind:value={search} />
			<span class="sort">
				<button
					class="sort-toggle"
					class:active={sort === 'recent'}
					onclick={() => (sort = 'recent')}>Most Recent</button
				>
				<button class="sort-toggle" class:active={sort === 'side'} onclick={() => (sort = 'side')}
					>By Side</button
				>
			</span>
		</div>

		{#if form?.error && !form?.id}
			<p class="error">{form.error}</p>
		{/if}

		{#if groups.every((group) => group.clears.length === 0)}
			<p class="empty">{data.clears.length > 0 ? 'No clears found' : 'No clears yet!'}</p>
		{/if}

		{#each groups as group}
			{#if group.name && group.clears.length > 0}
				<h2>{group.name}</h2>
			{/if}
			{#each group.clears as clear (clear.id)}
				<div class="clear">
					{#if editing !== clear.id}
						<div class="clear-info">
							<div class="details">
								<a
									class="tier-mod {clear.tierName.startsWith('Catstare') ? 'catstare-mod' : ''}"
									href="/mods/{clear.modId}"
									style="--tier-color: #{clear.tierColor}; --hover-color: #{hoverColor(clear)};"
									>{clear.name}</a
								>
								<small>
									{#if clear.tierName.startsWith('Catstare')}
										Catstare
									{:else}
										{clear.tierName}{sort === 'recent' ? ` - ${clear.sideName}` : ''}
									{/if}
									{#if clear.clearedDate}
										| Cleared {formatDate(clear.clearedDate)}
									{/if}
								</small>
								{#if clear.isPrivate}
									<span class="private-tag">Private</span>
								{/if}
							</div>
							<div class="buttons">
								<button onclick={() => (editing = clear.id)}>Edit</button>
								<form
									method="POST"
									action="?/remove"
									use:enhance={({ cancel }) => {
										if (!confirm(`Remove your clear for ${clear.name}?`)) {
											cancel();
										}
									}}
								>
									<input type="hidden" name="id" value={clear.id} />
									<button>Remove</button>
								</form>
							</div>
						</div>
					{:else}
						<form
							method="POST"
							action="?/update"
							use:enhance={() => {
								return async ({ result, update }) => {
									await update();
									if (result.type === 'success') {
										editing = null;
									}
								};
							}}
						>
							<input type="hidden" name="id" value={clear.id} />
							<h3><a href="/mods/{clear.modId}">{clear.name}</a></h3>
							<div class="fields">
								<label class="proof">
									Proof
									<input
										type="text"
										name="proof"
										value={clear.isLocalProof ? '' : clear.proof}
										placeholder={clear.isLocalProof
											? 'Uploaded images (enter a link to replace)'
											: 'https://imgur.com/a/BaxjPdY'}
									/>
								</label>
								<label>
									Clear Date
									<input
										type="date"
										name="clearedDate"
										value={clear.clearedDate
											? new Date(clear.clearedDate).toISOString().slice(0, 10)
											: ''}
									/>
								</label>
								<label>
									Deaths
									<input
										class="deaths"
										type="number"
										name="deaths"
										min="0"
										value={clear.deaths ?? ''}
									/>
								</label>
								<label>
									Time Taken
									<span class="time-inputs">
										<input
											type="number"
											name="hours"
											min="0"
											value={clear.timeTaken != null ? Math.floor(clear.timeTaken / 3600) : ''}
											placeholder="H"
										/>:<input
											type="number"
											name="minutes"
											min="0"
											value={clear.timeTaken != null ? Math.floor(clear.timeTaken / 60) % 60 : ''}
											placeholder="M"
										/>:<input
											type="number"
											name="seconds"
											min="0"
											value={clear.timeTaken != null ? clear.timeTaken % 60 : ''}
											placeholder="S"
										/>
									</span>
								</label>
								<label>
									Full Clear?
									<input type="checkbox" name="isFc" checked={clear.isFc} />
								</label>
								<label>
									Notes
									<input type="text" name="publicNotes" value={clear.publicNotes ?? ''} />
								</label>
								<label>
									Private?
									<input type="checkbox" name="isPrivate" checked={clear.isPrivate} />
								</label>
							</div>
							{#if form?.error && form?.id === clear.id}
								<p class="error">{form.error}</p>
							{/if}
							<div class="buttons">
								<button type="button" onclick={() => (editing = null)}>Cancel</button>
								<button>Save</button>
							</div>
						</form>
					{/if}
				</div>
			{/each}
		{/each}
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

		h1,
		h2 {
			margin: 0;
			padding: 0.5rem;
			text-align: center;
		}

		h2 {
			border-top: 1px solid grey;
		}
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.5rem 1rem;
		padding: 0 1rem 1rem;

		input {
			width: min(300px, 100%);
			font-size: 16px;
		}
	}

	.sort-toggle {
		padding: 2px 7px;
	}

	.sort-toggle.active {
		background-color: light-dark(color-mix(in srgb, pink 50%, white), #5b2c6f);
		color: light-dark(black, white);
		border: 1px solid light-dark(#767676, #6b6b6b);
		border-radius: 3px;
	}

	:global(:root[data-theme='dark']) .sort-toggle.active {
		background-color: color-mix(in srgb, blueviolet 45%, black);
		color: white;
	}

	.empty,
	.error {
		margin: 0;
		padding: 0.5rem;
		text-align: center;
	}

	.empty {
		border-top: 1px solid grey;
	}

	.error {
		color: red;
	}

	.clear {
		padding: 0.5rem 1rem;
		border-top: 1px solid color-mix(in srgb, grey 60%, transparent);

		h2 + & {
			border-top-color: grey;
		}
	}

	.clear-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem 1rem;

		@media (width < 1000px) {
			flex-wrap: wrap;
		}
	}

	.details {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.5rem;
		overflow-wrap: anywhere;

		small {
			color: grey;
		}
	}

	@media (width < 1000px) {
		.details a.tier-mod {
			color: var(--tier-color);

			&:hover {
				color: var(--hover-color);
			}
		}

		:global(:root:not([data-theme='dark'])) .details a.tier-mod:not(.catstare-mod) {
			color: color-mix(in srgb, var(--tier-color) 70%, black);

			&:hover {
				color: color-mix(in srgb, var(--hover-color) 70%, black);
			}
		}

		.details a.tier-mod.catstare-mod {
			color: CanvasText;

			&:hover {
				color: grey;
			}
		}
	}

	.private-tag {
		padding: 0 6px;
		font-size: 12px;
		border: 1px solid grey;
		border-radius: 20px;
	}

	.buttons {
		display: flex;
		gap: 0.5rem;
		margin-left: auto;

		button {
			padding: 2px 10px;
		}
	}

	h3 {
		margin: 0.25rem 0 0.75rem;
		text-align: center;
	}

	.fields {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem 1.5rem;
		margin-bottom: 0.75rem;

		label {
			display: grid;
			justify-items: center;
			align-content: start;
			gap: 0.25rem;
		}

		input:not([type='checkbox'], [type='date'], .deaths, .time-inputs input) {
			width: 150px;
		}

		.proof input[type='text'] {
			width: min(310px, 80vw);
		}

		.deaths {
			width: 50px;
		}

		.time-inputs input {
			width: 2rem;
			margin: 0 3px;

			&:first-child {
				width: 2.5rem;
			}
		}
	}

	form .buttons {
		justify-content: center;
		margin-left: 0;
	}
</style>
