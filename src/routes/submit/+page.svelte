<script>
	// Imports
	import { enhance } from '$app/forms';

	// Data from server
	let { data, form } = $props();

	// Boolean states
	let submitting = $state(false); // Set the submitting trigger for form enhance
	let displayMods = $state(false); // The switch for showing mod selection

	// String states
	let searchFilter = $state(''); // Player input as a search filter

	// Array states
	let filteredMods = $state([]); // Filtered mods to match search filter
	let submittingMods = $state([]); // Mods that the player's submitting

	// Non-state variables
	let selectedModIndex = 0; // Know which mod the player is hovering over when using keyboard input

	// Function to filter mods
	function modsFilter(filter) {
		return (filteredMods = data.mods
			.filter((m) => {
				return m.name.toLowerCase().includes(filter.toLowerCase().trim());
			})
			.sort((a, b) => a.name > b.name));
	}
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance={() => {
		submitting = true;

		return async ({ update }) => {
			console.log(update, update());
			const resolved = await update();
			submitting = false;
		};
	}}
>
	<input
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
					break;
			}
		}}
		oninput={() => {
			modsFilter(searchFilter);
		}}
	/>
	{#if displayMods}
		{#if !searchFilter}
			{(filteredMods = [])}
			{#each data.mods as mod}
				<p>
					{mod.name}
					<button
						onclick={() => {
							if (!submittingMods.find((submittingMod) => submittingMod.id === mod.id)) {
								submittingMods.push({ id: mod.id, name: mod.name });
								submittingMods.sort((a, b) => a.id - b.id);
							}

							searchFilter = '';
							displayMods = false;
						}}>Add mod</button
					>
				</p>
			{/each}
		{:else if filteredMods.length > 0}
			{#each filteredMods as mod}
				<p>
					{mod.name}
					<button
						onclick={() => {
							if (!submittingMods.find((submittingMod) => submittingMod.id === mod.id)) {
								submittingMods.push({ id: mod.id, name: mod.name });
								submittingMods.sort((a, b) => a.id - b.id);
							}

							searchFilter = '';
							displayMods = false;
						}}>Add mod</button
					>
				</p>
			{/each}
		{/if}
	{/if}

	<button>Submit</button>

	{#if submitting}
		Submitting mods...
	{/if}

	<br />

	<input type="checkbox" id="honor-pledge" required /><label for="honor-pledge"
		>I swear that my clear is legitimate, that I am following the rules of this event, and that I am
		respecting other celeste players by not cheating or faking my clear.</label
	>

	<br />

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

	{#if form?.error}
		<p class="error">{@html form.error}</p>
	{/if}

	{#each submittingMods as mod}
		<div class="mod-data-submit">
			<h2>{mod.name}</h2>
			<label for="{mod.id}-proof">Proof:</label>
			<input
				id="{mod.id}-proof"
				name="{mod.id}-link"
				value={mod.proof}
				placeholder="https://imgur.com/a/BaxjPdY"
			/>
			<input
				id="{mod.id}-proof"
				name="{mod.id}-upload"
				value={mod.proof}
				multiple
				type="file"
				accept="image/png image/jpeg"
			/>
			<label for="{mod.id}-death-count">Deaths:</label>
			<input id="{mod.id}-death-count" name="{mod.id}-deaths" type="number" />
			<label for="{mod.id}-time-taken">Clear Time:</label>
			<input id="{mod.id}-time-taken" name="{mod.id}-time" type="text" />
			<label for="{mod.id}-clear-date">Clear Date:</label>
			<input id="{mod.id}-clear-date" name="{mod.id}-date" type="date" />
			<label for="{mod.id}-full-clear">Full Clear:</label>
			<input id="{mod.id}-full-clear" name="{mod.id}-fc" type="checkbox" />
			<label for="{mod.id}-private">Private:</label>
			<input id="{mod.id}-private" name="{mod.id}-private" type="checkbox" />
			<label for="{mod.id}-private-notes">Private Notes:</label>
			<input id="{mod.id}-private-notes" name="{mod.id}-privateNotes" type="text" />
			<label for="{mod.id}-public-notes">Public Notes:</label>
			<input id="{mod.id}-public-notes" name="{mod.id}-publicNotes" type="text" />
			{#if data.player.role}
				<label for="{mod.id}-mod-notes">Mod Notes:</label>
				<input id="{mod.id}-mod-notes" name="{mod.id}-modNotes" type="text" />
			{/if}
		</div>
	{/each}
</form>
