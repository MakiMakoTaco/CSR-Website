<script>
	// Imports
	import { enhance } from '$app/forms';
	import { preventDefault } from 'svelte/legacy';

	// Data from server
	let { data, form } = $props();
	let sides = $state([]);

	// Boolean states
	let submitting = $state(false); // Set the submitting trigger for form enhance
	let displayMods = $state(false); // The switch for showing mod selection
	// let hasFocus = $state(false);

	// String states
	let searchFilter = $state(''); // Player input as a search filter

	// Non-state variables
	let selectedModIndex = 0; // Know which mod the player is hovering over when using keyboard input

	let filteredMods = $derived.by(async () => {
		if (!sides || sides.length <= 0) return [];

		const filter = searchFilter.toLowerCase().trim().split(' ');

		const mods = sides.flatMap((side) =>
			side.tiers.flatMap((tier) => tier.mods.filter((mod) => !mod.submitting).flat())
		);

		if (!filter || filter == '') return mods;

		const filtered = mods
			.filter((mod) => {
				let modMatch = true;

				filter.forEach((word, index) => {
					let filterMatch = false;
					mod.matches.forEach((match) => {
						if (match.toLowerCase().includes(word)) filterMatch = true;
					});

					if (!filterMatch) modMatch = false;
				});

				return modMatch;
			})
			.sort((a, b) => {
				let scoreA = 0;
				let scoreB = 0;

				if (
					a.name.toLowerCase() === searchFilter.toLowerCase() &&
					b.name.toLowerCase() !== searchFilter.toLowerCase()
				) {
					return -1;
				} else if (
					a.name.toLowerCase() !== searchFilter.toLowerCase() &&
					b.name.toLowerCase() === searchFilter.toLowerCase()
				) {
					return 1;
				}

				if (a.name === searchFilter && b.name !== searchFilter) {
					return -1;
				} else if (a.name !== searchFilter && b.name === searchFilter) {
					return 1;
				}

				filter.forEach((filterWord) => {
					a.matches.forEach((modWord) => {
						if (modWord.toLowerCase() === filterWord) {
							scoreA += 5;
						} else if (modWord.toLowerCase().includes(filterWord)) {
							scoreA++;
						}
					});

					b.matches.forEach((modWord) => {
						if (modWord.toLowerCase() === filterWord) {
							scoreB += 5;
						} else if (modWord.toLowerCase().includes(filterWord)) {
							scoreB++;
						}
					});
				});

				if (scoreA > scoreB) {
					return -1;
				} else if (scoreA < scoreB) {
					return 1;
				}
			});

		return filtered;
	});

	$effect(async () => {
		const promise = await data.sides;
		if (!promise) return [];

		sides = await Promise.all(promise);
	});
</script>

<svelte:head>
	<title>Submit - CSR</title>
	<meta name="description" content="Submit mods to CSR" />
	<meta name="keywords" content="CSR, Celeste, Skill, Rating, Submit" />
</svelte:head>

<main>
	{#if form?.error}
		<p class="error">
			{@html form.error}
		</p>
	{/if}
	{#await sides}
		Fetching mods...
	{:then sides}
		<div class="mod-search-container">
			<div class="mod-search-border">
				<div class="search-bar">
					<span>
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
										console.log(
											`Pressed enter. Selected mod: ${filteredMods[selectedModIndex].name}`
										);
										break;
									case 'Escape':
										displayMods = false;
										searchFilter = '';

										event.target.blur();
										break;
								}
							}}
						/>
						<button
							class="close-mod-filter"
							onclick={() => {
								displayMods = false;
								searchFilter = '';
							}}
							hidden={!displayMods}>Close</button
						>
					</span>
				</div>

				{#if displayMods}
					{#await filteredMods then mods}
						{#each mods as mod}
							{#if !mod.hidden}
								<div>
									<span class="mod-search-name" style="color: #{mod.color};">{mod.fullName}</span>
									<button
										class="add-mod"
										onclick={async () => {
											mod.submitting = true;

											searchFilter = '';
											displayMods = false;
										}}>Add mod</button
									>
								</div>
							{/if}
						{/each}
					{/await}
				{/if}
			</div>
		</div>

		{#if submitting}
			Submitting mods...
		{/if}

		<br />
		{#if sides.flatMap((side) => side.tiers.flatMap((tier) => tier.mods
					.filter((mod) => mod.submitting)
					.flat())).length > 0}
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
						{#each sides.flatMap((side) => side.tiers.flatMap((tier) => tier.mods
									.filter((mod) => mod.submitting)
									.flat())) as mod}
							<div class="submission">
								<div class="mod-name">
									<h2 style="color: #{mod.color};">
										{mod.fullName}
										<button
											onclick={() => {
												event.preventDefault();
												mod.submitting = false;
											}}>Remove mod</button
										>
									</h2>
								</div>
								<div class="mod-data">
									<span id="proofs">
										<label for="{mod.id}-proof">Proof:</label>
										<div id="{mod.id}-url">
											<input
												id="{mod.id}-proof"
												name="{mod.id}-proof"
												placeholder="https://imgur.com/a/BaxjPdY"
											/>
										</div>
										<div id="{mod.id}-image" hidden>
											<input
												id="{mod.id}-proof"
												name="{mod.id}-image"
												type="file"
												accept="image/webp, image/png, image/jpg"
												multiple
											/>
											<button
												onclick={(e) => {
													e.preventDefault();

													document.getElementById(`${mod.id}-image`).firstChild.value = '';
												}}>Reset</button
											>
										</div>
										<button
											onclick={(e) => {
												e.preventDefault();

												const url = document.getElementById(`${mod.id}-proof`);
												const image = document.getElementById(`${mod.id}-image`);

												if (url.hidden) {
													url.hidden = false;
													image.hidden = true;

													this.textContent = 'Use Image';
												} else {
													url.hidden = true;
													image.hidden = false;

													this.textContent = 'Use Link';
												}
											}}>Use Image</button
										>
									</span>
									<span id="date">
										<label for="{mod.id}-clear-date">Clear Date:</label>
										<input id="{mod.id}-clear-date" name="{mod.id}-clearedDate" type="date" />
									</span>
									<span id="deaths">
										<label for="{mod.id}-death-count">Deaths:</label>
										<input id="{mod.id}-death-count" name="{mod.id}-deaths" type="number" />
									</span>
									<span id="time">
										<label for="{mod.id}-time-taken">Clear Time:</label>
										<input id="{mod.id}-time-taken" name="{mod.id}-timeTaken" type="text" />
									</span>
									<!-- <label for="{mod.id}-full-clear">Full Clear:</label>
					<input id="{mod.id}-full-clear" name="{mod.id}-fc" type="checkbox" /> -->
									<!-- <label for="{mod.id}-private">Private:</label>
					<input id="{mod.id}-private" name="{mod.id}-private" type="checkbox" /> -->
									<span id="notes">
										<label for="{mod.id}-notes">Notes:</label>
										<input id="{mod.id}-notes" name="{mod.id}-publicNotes" type="text" />
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
					>I swear that my clear is legitimate, that I am following the rules of this event, and
					that I am respecting other Celeste players by not cheating or faking my clear.</label
				>
				<br />
				<button
					onclick={(e) => {
						const submittingMods = sides.flatMap((side) =>
							side.tiers.flatMap((tier) => tier.mods.filter((mod) => mod.submitting).flat())
						);

						submittingMods.forEach((mod) => {
							const url = document.getElementById(`${mod.id}-proof`);
							const image = document.getElementById(`${mod.id}-image`);

							if (url.hidden) {
								url.firstChild.value = '';
							} else {
								image.firstChild.value = '';
							}
						});
					}}
					disabled={submitting}>Submit</button
				>
			</form>
		{/if}
	{/await}
</main>

<style>
	.mod-search-container {
		display: grid;

		> div {
			place-self: center;
			display: grid;
			gap: 1rem;

			/* border: 0.5rem solid;
			border-radius: 5px; */

			> * {
				padding: 0 10px;
				justify-self: center;
				align-items: center;
				display: grid;
				width: 50vw;
				max-width: 700px;
				grid-auto-flow: column;
				grid-template-columns: 2fr 1fr;

				> * {
					height: fit-content;
					max-width: fit-content;
				}
			}

			.search-bar {
				grid-template-columns: 1fr;
				justify-items: center;

				input {
					font-size: large;
				}
			}
		}
	}

	.mod-search-name {
		text-align: left;
	}

	.add-mod {
		justify-self: center;
	}

	.mod-selection {
		align-self: center;
		justify-self: center;

		margin: 20px;
	}

	.close-mod-filter {
		width: fit-content;
		padding: 2px 5px;
		border-radius: 20px;
		border-color: transparent;
	}

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
		margin-bottom: 10px;

		> span {
			display: grid;
			min-width: auto;
			justify-self: center;

			> * {
				max-width: fit-content;
				justify-self: center;
				margin-bottom: 5px;
			}
		}

		input {
			width: minmax(min(150px, 100%), 1fr);
			height: fit-content;
		}
	}
</style>
