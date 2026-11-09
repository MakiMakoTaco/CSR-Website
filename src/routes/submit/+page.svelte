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

	let filteredMods = $derived.by(() => {
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

	let modsAdded = $derived(
		sides.flatMap((side) =>
			side.tiers.flatMap((tier) => tier.mods.filter((mod) => mod.submitting).flat())
		).length > 0
	);

	let failedMod = $derived.by(() => {
		if (!form?.error || !sides || sides.length <= 0) return;

		const modId = form.modId;
		const mods = sides.flatMap((side) => side.tiers.flatMap((tier) => tier.mods));
		const matchedMod = mods.find((mod) => mod.id == modId);

		return matchedMod;
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
	{#if form?.success}
		<div class="toast">
			Successfully submitted for {form.modCount} mod{form.modCount > 1 ? 's' : ''}
		</div>
	{/if}
	{#await sides}
		Fetching mods...
	{:then sides}
		{#if form?.error}
			<p class="error">
				{failedMod?.fullName}
				{@html form.error}
			</p>
		{/if}
		<div class="mod-search-container">
			<div class="mod-search-border">
				<div class="search-bar">
					<span>
						<label for="mod-search">Search Mods:</label>
						<input
							id="mod-search"
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
							hidden={!displayMods || !modsAdded}>Close</button
						>
					</span>
				</div>

				{#if displayMods || !modsAdded}
					<div class="mod-list">
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
					</div>
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
									.flat())) as mod (mod.id)}
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
										<label for="{mod.id}-proof">Proof</label>
										<span class="proof-toggles">
											<button
												class="proof-toggle active"
												onclick={(e) => {
													e.preventDefault();

													document.getElementById(`${mod.id}-proof`).hidden = false;
													document.getElementById(`${mod.id}-image`).hidden = true;

													e.currentTarget.classList.add('active');
													e.currentTarget.nextElementSibling.classList.remove('active');
												}}>Use Link</button
											>
											<button
												class="proof-toggle"
												onclick={(e) => {
													e.preventDefault();

													document.getElementById(`${mod.id}-proof`).hidden = true;
													document.getElementById(`${mod.id}-image`).hidden = false;

													e.currentTarget.classList.add('active');
													e.currentTarget.previousElementSibling.classList.remove('active');
												}}>Use Image</button
											>
										</span>
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
									</span>
									<span id="date">
										<label for="{mod.id}-clear-date">Clear Date<span>(Optional)</span></label>
										<input id="{mod.id}-clear-date" name="{mod.id}-clearedDate" type="date" />
									</span>
									<span id="deaths">
										<label for="{mod.id}-death-count">Deaths<span>(Optional)</span></label>
										<input id="{mod.id}-death-count" name="{mod.id}-deaths" type="number" />
									</span>
									<span id="time">
										<label for="{mod.id}-hours">Time Taken<span>(Optional)</span></label>
										<span class="time-inputs">
											<input
												id="{mod.id}-hours"
												name="{mod.id}-hours"
												type="number"
												min="0"
												placeholder="H"
											/>:<input
												name="{mod.id}-minutes"
												type="number"
												min="0"
												max="59"
												placeholder="M"
											/>:<input
												name="{mod.id}-seconds"
												type="number"
												min="0"
												max="59"
												placeholder="S"
											/>
										</span>
									</span>
									<span id="full-clear">
										<label for="{mod.id}-full-clear">Full Clear?<span>(Optional)</span></label>
										<input id="{mod.id}-full-clear" name="{mod.id}-isFc" type="checkbox" />
									</span>
									<!-- <span id="time">
										<label for="{mod.id}-time-taken">Clear Time:</label>
										<input id="{mod.id}-time-taken" name="{mod.id}-timeTaken" type="text" />
									</span> -->
									<!-- <label for="{mod.id}-full-clear">Full Clear:</label>
					<input id="{mod.id}-full-clear" name="{mod.id}-fc" type="checkbox" /> -->
									<!-- <label for="{mod.id}-private">Private:</label>
					<input id="{mod.id}-private" name="{mod.id}-private" type="checkbox" /> -->
									<span id="notes">
										<label for="{mod.id}-notes">Notes<span>(Optional)</span></label>
										<input id="{mod.id}-notes" name="{mod.id}-publicNotes" type="text" />
									</span>
									<span id="private">
										<label for="{mod.id}-private">Private?<span>(Optional)</span></label>
										<input id="{mod.id}-private" name="{mod.id}-isPrivate" type="checkbox" />
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
				<div class="pledge">
					<input type="checkbox" id="honor-pledge" required /><label for="honor-pledge"
						>I swear that my clear is legitimate, that I am following the rules of this event, and
						that I am respecting other Celeste players by not cheating or faking my clear.</label
					>
					<br />
					<button
						class="submit-button"
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
				</div>
			</form>
		{/if}
	{/await}
</main>

<style>
	.toast {
		opacity: 0;
		position: absolute;
		z-index: 1;
		left: 50%;
		translate: -50%;
		width: max-content;
		max-width: 90vw;
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		border: 2px solid pink;
		border-radius: 1rem;
		background-color: Canvas;

		transition: opacity;
		transition-behavior: allow-discrete;
		transition-delay: 5s;
		transition-duration: 1s;

		@starting-style {
			opacity: 1;
		}
	}

	.mod-search-container {
		display: grid;

		> div {
			place-self: center;
			display: grid;
			gap: 1rem;

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

				span {
					display: flex;
					align-items: center;
				}

				@media (width < 1000px) {
					width: 90vw;
					grid-template-columns: minmax(0, 1fr);

					span {
						display: grid;
						grid-template-columns: minmax(0, 1fr);
						justify-items: center;
						width: 100%;
						max-width: none;
					}
				}

				input {
					font-size: 24px;

					@media (width < 1000px) {
						box-sizing: border-box;
						max-width: calc(100% - 40px);
					}
				}
			}

			.mod-list {
				padding: 0;
				grid-template-columns: 1fr;
				grid-auto-flow: row;
				border: 1px solid grey;
				border-radius: 1rem;

				@media (width < 1000px) {
					width: 90vw;
				}

				&:empty {
					display: none;
				}

				> div {
					max-width: none;
					padding: 0.5rem 10px;
					display: grid;
					align-items: center;
					grid-template-columns: 2fr 1fr;
					border-top: 1px solid color-mix(in srgb, grey 30%, transparent);

					&:first-child {
						border-top: 0;
					}
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

	.pledge {
		text-align: center;
	}

	.mod-data input:not([type='checkbox'], [type='date'], [type='file'], .time-inputs input) {
		box-sizing: border-box;
		width: 150px;
		max-width: 100%;
	}

	.time-inputs {
		white-space: nowrap;

		input {
			width: 2rem;
			margin: 0 3px;

			&:first-child {
				width: 2.5rem;
			}
		}
	}

	#proofs {
		min-width: min(310px, 100%);

		> label {
			min-height: 0;

			@media (width >= 1000px) {
				margin-top: -8px;
			}
		}
	}

	.mod-data input[type='number'][name$='-deaths'] {
		width: 50px;
	}

	.proof-toggle.active {
		background-color: light-dark(color-mix(in srgb, pink 50%, white), #5b2c6f);
		color: light-dark(black, white);
		border: 1px solid light-dark(#767676, #6b6b6b);
		border-radius: 3px;
		padding: 2px 7px;
	}

	:global(:root[data-theme='dark']) .proof-toggle.active {
		background-color: color-mix(in srgb, blueviolet 45%, black);
		color: white;
	}

	.submit-button {
		margin-top: 0.5rem;
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
		justify-self: center;
		text-align: center;

		h2 {
			margin-top: 0.375em;
			margin-bottom: 0.7em;
		}

		button {
			vertical-align: 0.3em;
		}
	}

	.mod-data {
		--row-gap: 2rem;

		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--row-gap) 2rem;
		overflow: hidden;
		margin-bottom: 10px;
		padding-top: calc(var(--row-gap) / 2);

		> span {
			position: relative;
			display: grid;
			align-content: start;
			min-width: auto;

			&::before {
				content: '';
				position: absolute;
				top: calc(var(--row-gap) / -2);
				left: -100vw;
				right: -100vw;
				border-top: 1px solid color-mix(in srgb, grey 60%, transparent);
			}

			> * {
				max-width: fit-content;
				justify-self: center;
				margin-bottom: 5px;
			}

			> label {
				display: grid;
				justify-items: center;
				align-content: end;
				min-height: 2lh;
			}
		}

		input {
			width: minmax(min(150px, 100%), 1fr);
			height: fit-content;
		}
	}
</style>
