<script>
	// Imports
	import { enhance } from '$app/forms';

	// Data from server
	let { data, form } = $props();

	// Boolean states
	let submitting = $state(false); // Set the submitting trigger for form enhance
	let displayMods = $state(false); // The switch for showing mod selection
	// let hasFocus = $state(false);

	// String states
	let searchFilter = $state(''); // Player input as a search filter

	// Array states
	let mods = $derived(data.mods);
	let filteredMods = $derived.by(() => {
		if (!searchFilter || searchFilter === '') {
			return mods;
		}
	}); // Filtered mods to match search filter
	let submittingMods = $state([]); // Mods that the player's submitting

	// Non-state variables
	let selectedModIndex = 0; // Know which mod the player is hovering over when using keyboard input

	// Function to filter mods
	function modsFilter(filter) {
		return (filteredMods = mods
			.filter((m) => {
				const filtered = filter.toLowerCase().trim();
				return (
					m.name.toLowerCase().includes(filter.toLowerCase().trim()) ||
					m.fullName.toLowerCase().includes(filter.toLowerCase().trim()) ||
					m.shorthand.shorthand?.includes(filtered) ||
					m.shorthand.gb_name?.toLowerCase().includes(filtered)
				);
			})
			.sort((a, b) => a.name > b.name));
	}
</script>

<main>
	<input
		class="mod-selection"
		bind:value={searchFilter}
		onfocusin={() => {
			displayMods = true;
		}}
		onkeydown={(event) => {
			if (selectedModIndex < 0) {
				selectedModIndex = filteredMods.length - 1;
			} else if (selectedModIndex >= filteredMods.length) {
				selectedModIndex = 0;
			}

			switch (event.key) {
				case 'ArrowUp':
					selectedModIndex--;
					break;
				case 'ArrowDown':
					selectedModIndex++;
					break;
				case 'Enter':
					console.log(`Pressed enter. Selected mod: ${filteredMods[selectedModIndex].name}`);
					break;
				case 'Escape':
					displayMods = false;
					searchFilter = '';

					event.target.blur();
					break;
			}
		}}
		oninput={() => {
			modsFilter(searchFilter);
		}}
	/>
	{#if displayMods}
		<button
			onclick={() => {
				displayMods = false;
				searchFilter = '';
			}}>Close</button
		>
	{/if}

	{#if submitting}
		Submitting mods...
	{/if}
	{#if displayMods}
		{#each filteredMods as mod}
			{#if !mod.hidden}
				<p style="color: #{mod.color};">
					{mod.fullName}
					<button
						onclick={() => {
							if (!submittingMods.find((submittingMod) => submittingMod.id === mod.id)) {
								submittingMods.push(mod);

								const modIndex = mods.indexOf(mod);
								mods.splice(modIndex, 1);
								filteredMods = mods;

								submittingMods.sort((a, b) => a.name > b.name);
							}

							searchFilter = '';
							displayMods = false;
						}}>Add mod</button
					>
				</p>
			{/if}
		{/each}
	{/if}

	<br />

	{#if form?.error}
		<p class="error">{@html form.error}</p>
	{/if}
	{#if submittingMods.length > 0}
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				submitting = true;

				return async ({ update }) => {
					const resolved = await update();
					submitting = false;
				};
			}}
		>
			<!-- {#each tiers as tier}
			<div class="tier-data-submit">
				<h2>{tier.name}</h2>
				{#each tier.mods as mod}
					<div class={mod.id}>
						<header>{mod.name}</header>
						<label for={mod.id}>Proof: </label>
						<input
							id={mod.id}
							name="{mod.id}-link"
							value={mod.proof}
							placeholder="https://imgur.com/a/BaxjPdY"
						/>
						<input
							id={mod.id}
							name="{mod.id}-upload"
							value={mod.proof}
							multiple
							type="file"
							accept="image/png image/jpeg"
						/>
					</div>
					<br />
				{/each}
			</div>
		{/each} -->

			<div id="submissions" class="submission-container">
				<span class="submission-border">
					{#each submittingMods as mod}
						<div class="submission">
							<div class="mod-name">
								<h2 style="color: #{mod.color};">
									{mod.fullName}
									<button
										onclick={() => {
											event.preventDefault();

											if (submittingMods.find((submittingMod) => submittingMod.id === mod.id)) {
												const modIndex = submittingMods.indexOf(mod);
												submittingMods.splice(modIndex, 1);

												mods = [...mods, mod].sort((a, b) => a.name > b.name);
											}
										}}>Remove mod</button
									>
								</h2>
							</div>
							<div class="mod-data">
								<span id="poof">
									<label for="{mod.id}-proof">Proof:</label>
									<input
										id="{mod.id}-proof"
										name="{mod.id}-proof"
										value={mod.proof}
										placeholder="https://imgur.com/a/BaxjPdY"
									/>
								</span>
								<span id="date">
									<label for="{mod.id}-clear-date">Clear Date:</label>
									<input id="{mod.id}-clear-date" name="{mod.id}-date" type="date" />
								</span>
								<!-- <input
						id="{mod.id}-proof"
						name="{mod.id}-upload"
						value={mod.proof}
						multiple
						type="file"
						accept="image/png image/jpeg"
					/> -->
								<span id="deaths">
									<label for="{mod.id}-death-count">Deaths:</label>
									<input id="{mod.id}-death-count" name="{mod.id}-deaths" type="number" />
								</span>
								<span id="time">
									<label for="{mod.id}-time-taken">Clear Time:</label>
									<input id="{mod.id}-time-taken" name="{mod.id}-time" type="text" />
								</span>
								<!-- <label for="{mod.id}-full-clear">Full Clear:</label>
					<input id="{mod.id}-full-clear" name="{mod.id}-fc" type="checkbox" /> -->
								<!-- <label for="{mod.id}-private">Private:</label>
					<input id="{mod.id}-private" name="{mod.id}-private" type="checkbox" /> -->
								<span id="notes">
									<label for="{mod.id}-notes">Notes:</label>
									<input id="{mod.id}-notes" name="{mod.id}-notes" type="text" />
								</span>
								<!-- <label for="{mod.id}-private-notes">Private Notes:</label>
					<input id="{mod.id}-private-notes" name="{mod.id}-privateNotes" type="text" />
					<label for="{mod.id}-public-notes">Public Notes:</label>
					<input id="{mod.id}-public-notes" name="{mod.id}-publicNotes" type="text" /> -->
								<!-- {#if data.player.role}
						<label for="{mod.id}-mod-notes">Mod Notes:</label>
						<input id="{mod.id}-mod-notes" name="{mod.id}-modNotes" type="text" />
					{/if} -->
							</div>
						</div>
					{/each}
				</span>
			</div>
			<br />
			<input type="checkbox" id="honor-pledge" required /><label for="honor-pledge"
				>I swear that my clear is legitimate, that I am following the rules of this event, and that
				I am respecting other Celeste players by not cheating or faking my clear.</label
			>
			<br />
			<button disabled={submitting}>Submit</button>
		</form>
	{/if}
</main>

<style>
	.submission-container {
		display: grid;
		justify-content: center;

		> span {
			display: grid;
			gap: 20px;
			border: 5px solid pink;
			padding: 10px;
			border-radius: 20px;
		}
	}

	.submission {
		width: 75vw;
	}

	.mod-name {
		justify-self: left;
	}

	.mod-data {
		--min-col-size: 200px;

		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(var(--min-col-size), 100%), 1fr));
		/* gap: 1rem; */
		margin-bottom: 10px;

		> * {
			min-width: auto;
			justify-self: center;
		}

		label {
			display: grid;
			justify-content: center;
		}

		input {
			width: minmax(min(150px, 100%), 1fr);
		}
	}
</style>
