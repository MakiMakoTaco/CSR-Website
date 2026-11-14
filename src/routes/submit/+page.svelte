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

	let filteredTiers = $derived.by(() => {
		const filter = searchFilter.toLowerCase().trim();
		if (!filter || !sides || sides.length <= 0) return [];

		const words = filter.split(' ');

		return sides
			.flatMap((side) => side.tiers)
			.filter((tier) => tier.entry && !tier.entry.submitting && tier.mods.length > 0)
			.map((tier) => tier.entry)
			.filter((entry) =>
				words.every((word) => entry.matches.some((match) => match.toLowerCase().includes(word)))
			)
			.sort((a, b) => (b.name.toLowerCase() === filter) - (a.name.toLowerCase() === filter));
	});

	let modListItems = $derived(
		searchFilter.trim()
			? [...filteredTiers, ...filteredMods]
			: sides.flatMap((side) =>
					side.tiers.flatMap((tier) => [
						...(tier.entry && !tier.entry.submitting && tier.mods.length > 0 ? [tier.entry] : []),
						...tier.mods.filter((mod) => !mod.submitting)
					])
				)
	);

	let submittingEntries = $derived(
		sides.flatMap((side) =>
			side.tiers.flatMap((tier) => [
				...(tier.entry?.submitting ? [tier.entry] : []),
				...tier.mods.filter((mod) => mod.submitting)
			])
		)
	);

	let modsAdded = $derived(submittingEntries.length > 0);

	function tierMods(entry) {
		const tier = sides.flatMap((side) => side.tiers).find((tier) => tier.entry?.id === entry.id);

		if (!tier) return [];

		const mods = tier.mods.filter((mod) => !mod.submitting);
		return mods.every((mod) => mod.cleared) ? mods : mods.filter((mod) => !mod.cleared);
	}

	function fillColumn(entry, column, event) {
		if (!String(entry.id).startsWith('t')) return;

		const source = event.currentTarget;
		const value =
			column === 'proof'
				? [...document.getElementsByName(`${entry.id}-proof`)]
						.map((input) => input.value.trim())
						.filter((link) => link)
						.join(' ')
				: source.value;
		document.querySelectorAll(`#${entry.id}-mods [data-column='${column}']`).forEach((input) => {
			if (input.type === 'checkbox') {
				input.checked = source.checked;
			} else {
				input.value = value;
			}
		});
	}

	function syncColumnCheckbox(entry, column) {
		const rows = [...document.querySelectorAll(`#${entry.id}-mods [data-column='${column}']`)];
		document.querySelector(`[name='${entry.id}-${column}']`).checked = rows.every(
			(input) => input.checked
		);
	}

	function setTierProofMode(entry, useImages) {
		if (!String(entry.id).startsWith('t')) return;

		document.querySelectorAll(`#${entry.id}-mods [data-column='proof']`).forEach((input) => {
			const modId = input.name.split('-')[0];
			input.name = `${modId}-${useImages ? 'image' : 'proof'}`;
			input.type = useImages ? 'file' : 'text';
			input.value = useImages ? '' : input.defaultValue;
			input.placeholder = useImages ? 'Uses tier images' : input.dataset.placeholder;
			input.multiple = useImages;
			input.disabled = false;

			const imageKey = document.getElementById(`${modId}-imageKey`);
			if (!useImages && !imageKey.value) {
				imageKey.value = entry.id;
			}
		});
	}

	function autoFillImages(entry, files) {
		const mods = sides
			.flatMap((side) => side.tiers)
			.find((tier) => tier.entry?.id === entry.id)
			.mods.filter((mod) => !mod.submitting);

		document.querySelectorAll(`#${entry.id}-mods [data-column='proof']`).forEach((input) => {
			const mod = mods.find((mod) => mod.id === Number(input.name.split('-')[0]));

			if (mod) {
				for (const file of files) {
					const fileParts = file.webkitRelativePath.split('/');
					if (
						[2, 3].includes(fileParts.length) &&
						(fileParts[1].toLowerCase().split(/\.[^.]*$/)[0] === mod.name.toLowerCase() ||
							fileParts[1]
								.toLowerCase()
								.replaceAll(/[<>:/\\|?\*]/g, '')
								.split('.')[0] === mod.name.toLowerCase().replaceAll(/[<>:/\\|?\*\.]/g, ''))
					) {
						input.type = 'text';
						input.value = `${fileParts[1]}${fileParts.length === 3 ? '/' : ''}`;
						input.disabled = true;

						// const imageKey = document.getElementById(`${mod.id}-imageKey`);
						// imageKey.name = `${mod.id}-image`;
						// imageKey.type = 'file';
						// imageKey.files = new File([file], file, {
						// 	type: file.type,
						// 	lastModified: file.lastModified
						// });
					}
				}
			}
		});
	}

	let errorClosed = $state(false);

	$effect(() => {
		form;
		errorClosed = false;
	});

	let failedMod = $derived.by(() => {
		if (!form?.error || !sides || sides.length <= 0) return;

		const modId = form.modId;
		const mods = sides.flatMap((side) =>
			side.tiers.flatMap((tier) => [...(tier.entry ? [tier.entry] : []), ...tier.mods])
		);
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
			{form.modCount > 0
				? `Successfully submitted for ${form.modCount} mod${form.modCount > 1 ? 's' : ''}`
				: 'No changes to existing clears submitted.'}
		</div>
	{/if}
	{#await sides}
		Fetching mods...
	{:then sides}
		{#if form?.error && !errorClosed}
			<div class="error">
				<button class="close-error" aria-label="Close" onclick={() => (errorClosed = true)}
					>✕</button
				>
				<p>
					{failedMod?.fullName}
					{@html form.error}
				</p>
			</div>
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

				{#if sides.length === 0}
					<div class="loading">Loading...</div>
				{:else if displayMods || !modsAdded}
					<div class="mod-list">
						{#each modListItems as mod}
							{#if String(mod.id).startsWith('t')}
								<div>
									<span class="mod-search-name tier-entry">{mod.fullName}</span>
									<button
										class="add-mod"
										onclick={() => {
											mod.submitting = true;

											searchFilter = '';
											displayMods = false;
										}}>Add Tier</button
									>
								</div>
							{:else if !mod.hidden}
								<div>
									<span class="mod-search-name" style="color: #{mod.color};">{mod.fullName}</span>
									<button
										class="add-mod"
										onclick={async () => {
											mod.submitting = true;

											searchFilter = '';
											displayMods = false;
										}}>Add Mod</button
									>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		</div>

		{#if submitting}
			Submitting mods...
		{/if}

		<br />
		{#if submittingEntries.length > 0}
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
						{#each submittingEntries as mod (mod.id)}
							<div class="submission">
								<div class="mod-name">
									<h2 style="color: #{mod.color};">
										{#if String(mod.id).startsWith('t')}
											{mod.fullName}
										{:else}
											<a href="/mods/{mod.id}" target="_blank">{mod.fullName}</a>
										{/if}
									</h2>
									<button
										class="remove-entry"
										onclick={() => {
											event.preventDefault();
											mod.submitting = false;
											mod.useImages = false;
										}}>{String(mod.id).startsWith('t') ? 'Remove Tier' : 'Remove Mod'}</button
									>
								</div>
								<div class="mod-data">
									{#if String(mod.id).startsWith('t')}
										<span class="affects-all">Affects All Rows</span>
									{/if}
									<span id="proofs">
										<label for="{mod.id}-proof">Proof</label>
										<span class="proof-toggles">
											<button
												class="proof-toggle"
												class:active={!mod.useImages}
												onclick={(e) => {
													e.preventDefault();
													if (!mod.useImages) return;

													document.getElementById(`${mod.id}-url`).hidden = false;
													document.getElementById(`${mod.id}-image`).hidden = true;

													mod.useImages = false;
													setTierProofMode(mod, false);
												}}>Use Link</button
											>
											<button
												class="proof-toggle"
												class:active={mod.useImages}
												onclick={(e) => {
													e.preventDefault();
													if (mod.useImages) return;

													document.getElementById(`${mod.id}-url`).hidden = true;
													document.getElementById(`${mod.id}-image`).hidden = false;

													mod.useImages = true;
													setTierProofMode(mod, true);
												}}>Use Image</button
											>
										</span>
										<div id="{mod.id}-url" class="proof-links">
											{#each { length: mod.linkCount ?? 1 }, index}
												<input
													id={index === 0 ? `${mod.id}-proof` : undefined}
													name="{mod.id}-proof"
													oninput={(e) => fillColumn(mod, 'proof', e)}
													placeholder="https://imgur.com/a/BaxjPdY"
												/>
												{#if index === 0}
													<button
														class="add-link"
														aria-label="Add link"
														onclick={(e) => {
															e.preventDefault();
															mod.linkCount = (mod.linkCount ?? 1) + 1;
														}}>+</button
													>
												{/if}
											{/each}
										</div>
										<div id="{mod.id}-image" hidden>
											{#if String(mod.id).startsWith('t')}
												<input
													id="{mod.id}-proof"
													name="{mod.id}-image"
													type="file"
													webkitdirectory
													onchange={(e) => {
														autoFillImages(mod, e.target.files);
													}}
												/>

												<button
													onclick={(e) => {
														e.preventDefault();

														// remove child mods knowing the file
													}}>Reset</button
												>
											{:else}
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
											{/if}
										</div>
									</span>
									<span id="date">
										<label for="{mod.id}-clear-date">Clear Date<span>(Optional)</span></label>
										<input
											id="{mod.id}-clear-date"
											name="{mod.id}-clearedDate"
											oninput={(e) => fillColumn(mod, 'clearedDate', e)}
											type="date"
										/>
									</span>
									{#if !String(mod.id).startsWith('t')}
										<span id="deaths">
											<label for="{mod.id}-death-count">Deaths<span>(Optional)</span></label>
											<input
												id="{mod.id}-death-count"
												name="{mod.id}-deaths"
												oninput={(e) => fillColumn(mod, 'deaths', e)}
												type="number"
											/>
										</span>
									{/if}
									{#if !String(mod.id).startsWith('t')}
										<span id="time">
											<label for="{mod.id}-hours">Time Taken<span>(Optional)</span></label>
											<span class="time-inputs">
												<input
													id="{mod.id}-hours"
													name="{mod.id}-hours"
													oninput={(e) => fillColumn(mod, 'hours', e)}
													type="number"
													min="0"
													placeholder="H"
												/>:<input
													name="{mod.id}-minutes"
													oninput={(e) => fillColumn(mod, 'minutes', e)}
													type="number"
													min="0"
													max="59"
													placeholder="M"
												/>:<input
													name="{mod.id}-seconds"
													oninput={(e) => fillColumn(mod, 'seconds', e)}
													type="number"
													min="0"
													max="59"
													placeholder="S"
												/>
											</span>
										</span>
									{/if}
									<span id="full-clear">
										<label for="{mod.id}-full-clear">Full Clear?<span>(Optional)</span></label>
										<input
											id="{mod.id}-full-clear"
											name="{mod.id}-isFc"
											checked={String(mod.id).startsWith('t') &&
												tierMods(mod).every((tierMod) => tierMod.clear?.isFc)}
											oninput={(e) => fillColumn(mod, 'isFc', e)}
											type="checkbox"
										/>
									</span>
									<!-- <span id="time">
										<label for="{mod.id}-time-taken">Clear Time:</label>
										<input id="{mod.id}-time-taken" name="{mod.id}-timeTaken" type="text" />
									</span> -->
									<!-- <label for="{mod.id}-full-clear">Full Clear:</label>
					<input id="{mod.id}-full-clear" name="{mod.id}-fc" type="checkbox" /> -->
									<!-- <label for="{mod.id}-private">Private:</label>
					<input id="{mod.id}-private" name="{mod.id}-private" type="checkbox" /> -->
									{#if !String(mod.id).startsWith('t')}
										<span id="notes">
											<label for="{mod.id}-notes">Notes<span>(Optional)</span></label>
											<input
												id="{mod.id}-notes"
												name="{mod.id}-publicNotes"
												oninput={(e) => fillColumn(mod, 'publicNotes', e)}
												type="text"
											/>
										</span>
									{/if}
									<span id="private">
										<label for="{mod.id}-private">Private?<span>(Optional)</span></label>
										<input
											id="{mod.id}-private"
											name="{mod.id}-isPrivate"
											checked={String(mod.id).startsWith('t') &&
												tierMods(mod).every((tierMod) => tierMod.clear?.isPrivate)}
											oninput={(e) => fillColumn(mod, 'isPrivate', e)}
											type="checkbox"
										/>
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
								<p class="private-note">
									The private option makes the entire clear private. The clear will not show up
									publicly, but you can still view it normally.
								</p>
								{#if String(mod.id).startsWith('t')}
									<div class="tier-mods" id="{mod.id}-mods">
										<div class="tier-mods-panel">
											<h3>
												{tierMods(mod).length} mod{tierMods(mod).length === 1 ? '' : 's'} in this tier
												{#if tierMods(mod).every((tierMod) => tierMod.cleared)}
													<span>(all cleared, only changes will be saved)</span>
												{/if}
											</h3>
											<div class="tier-mods-table">
												<table>
													<thead>
														<tr>
															<th>Mod</th>
															<th>Proof</th>
															<th>Clear Date</th>
															<th>Deaths</th>
															<th>Time Taken</th>
															<th>Full Clear?</th>
															<th>Notes</th>
															<th>Private?</th>
														</tr>
													</thead>
													<tbody>
														{#each tierMods(mod) as tierMod (tierMod.id)}
															<tr>
																<td class="tier-mod-name">{tierMod.name}</td>
																<td>
																	<input
																		name="{tierMod.id}-proof"
																		data-column="proof"
																		value={tierMod.clear?.proof ?? ''}
																		placeholder={tierMod.clear?.isLocalProof
																			? 'Uploaded images'
																			: 'https://imgur.com/a/BaxjPdY'}
																		data-placeholder={tierMod.clear?.isLocalProof
																			? 'Uploaded images'
																			: 'https://imgur.com/a/BaxjPdY'}
																		onchange={(e) => {
																			const imageKey = document.getElementById(
																				`${tierMod.id}-imageKey`
																			);
																			if (e.target.files.length > 0) {
																				imageKey.value = null;
																			} else {
																				imageKey.value = mod.id;
																			}
																		}}
																	/>
																	<input name="{tierMod.id}-name" value={tierMod.name} hidden />
																	<input
																		id="{tierMod.id}-imageKey"
																		name="{tierMod.id}-imageKey"
																		value={mod.id}
																		hidden
																	/>
																	{#if tierMod.cleared}
																		<input type="hidden" name="{tierMod.id}-existing" value="1" />
																	{/if}
																</td>
																<td>
																	<input
																		name="{tierMod.id}-clearedDate"
																		value={tierMod.clear?.clearedDate ?? ''}
																		data-column="clearedDate"
																		type="date"
																	/>
																</td>
																<td>
																	<input
																		class="tier-deaths"
																		name="{tierMod.id}-deaths"
																		value={tierMod.clear?.deaths ?? ''}
																		data-column="deaths"
																		type="number"
																		min="0"
																	/>
																</td>
																<td>
																	<span class="time-inputs">
																		<input
																			name="{tierMod.id}-hours"
																			value={tierMod.clear?.hours ?? ''}
																			data-column="hours"
																			type="number"
																			min="0"
																			placeholder="H"
																		/>:<input
																			name="{tierMod.id}-minutes"
																			value={tierMod.clear?.minutes ?? ''}
																			data-column="minutes"
																			type="number"
																			min="0"
																			max="59"
																			placeholder="M"
																		/>:<input
																			name="{tierMod.id}-seconds"
																			value={tierMod.clear?.seconds ?? ''}
																			data-column="seconds"
																			type="number"
																			min="0"
																			max="59"
																			placeholder="S"
																		/>
																	</span>
																</td>
																<td>
																	<input
																		name="{tierMod.id}-isFc"
																		checked={tierMod.clear?.isFc ?? false}
																		oninput={() => syncColumnCheckbox(mod, 'isFc')}
																		data-column="isFc"
																		type="checkbox"
																	/>
																</td>
																<td>
																	<input
																		name="{tierMod.id}-publicNotes"
																		value={tierMod.clear?.publicNotes ?? ''}
																		data-column="publicNotes"
																		type="text"
																	/>
																</td>
																<td>
																	<input
																		name="{tierMod.id}-isPrivate"
																		checked={tierMod.clear?.isPrivate ?? false}
																		oninput={() => syncColumnCheckbox(mod, 'isPrivate')}
																		data-column="isPrivate"
																		type="checkbox"
																	/>
																</td>
															</tr>
														{/each}
													</tbody>
												</table>
											</div>
										</div>
									</div>
								{/if}
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
					<div class="submit-button">
						<button
							onclick={(e) => {
								submittingEntries.forEach((mod) => {
									const url = document.getElementById(`${mod.id}-url`);
									const image = document.getElementById(`${mod.id}-image`);

									if (url.hidden) {
										url.querySelectorAll('input').forEach((input) => (input.value = ''));
									} else {
										image.firstChild.value = '';
									}
								});
							}}
							disabled={submitting}>Submit</button
						>
					</div>
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

	.error {
		position: fixed;
		z-index: 1;
		top: 100px;
		top: anchor(--navbar bottom, 100px);
		left: 50%;
		translate: -50%;
		width: max-content;
		max-width: min(700px, 90vw);
		box-sizing: border-box;
		margin-top: 0.5rem;
		padding: 0.75rem 2.5rem 0.75rem 1rem;
		border: 2px solid pink;
		border-radius: 1rem;
		background-color: Canvas;

		@media (width < 1000px) {
			top: 2.5rem;
		}

		p {
			margin: 0;
		}
	}

	.close-error {
		position: absolute;
		top: 0.4rem;
		right: 0.6rem;
		padding: 0 4px;
		font-size: 16px;
		background: none;
		border: none;
		color: grey;
		cursor: pointer;

		&:hover {
			color: CanvasText;
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

			.loading {
				width: fit-content;
				grid-template-columns: 1fr;
				padding: 0.5rem 1rem;
				border: 1px solid grey;
				border-radius: 1rem;
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

	.tier-entry {
		font-weight: bold;
	}

	.private-note {
		margin: 0 1rem 10px;
		font-size: 12px;
		color: grey;
		text-align: center;
	}

	.mod-data > .affects-all {
		z-index: 1;
		flex-basis: 100%;
		margin-bottom: calc(12px - var(--row-gap));
		padding-bottom: 0.5rem;
		font-weight: bold;
		text-decoration: underline;
		text-align: center;
		background: Canvas;
	}

	.tier-mods {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid color-mix(in srgb, grey 60%, transparent);
	}

	.tier-mods-panel {
		h3 {
			margin: 0;
			padding: 0.5rem;
			text-align: center;

			span {
				font-size: 14px;
				font-weight: normal;
			}
		}
	}

	.tier-mods-table {
		overflow-x: auto;

		table {
			width: 100%;
			border-collapse: collapse;
		}

		tr {
			border-top: 1px solid color-mix(in srgb, grey 60%, transparent);
		}

		thead tr {
			border-top: none;
		}

		th,
		td {
			padding: 0.4rem 0.5rem;
			text-align: center;
			white-space: nowrap;
		}

		.tier-mod-name {
			min-width: 150px;
			text-align: left;
			white-space: normal;
			overflow-wrap: anywhere;
		}

		input[type='text'],
		input:not([type]) {
			width: 150px;
		}

		.tier-deaths {
			width: 50px;
		}

		.time-inputs input {
			width: 1.8em;

			@media (width >= 1000px) {
				width: 2rem;

				&:first-child {
					width: 2.5rem;
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
			width: 1.8em;
			margin: 0 3px;

			@media (width >= 1000px) {
				width: 2rem;

				&:first-child {
					width: 2.5rem;
				}
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

	.proof-links {
		grid-template-columns: auto auto;
		align-items: center;
		gap: 5px;

		&:not([hidden]) {
			display: grid;
		}

		input {
			grid-column: 1;
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

		button {
			padding: 5px 14px;
			font-size: 18px;
		}
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

		&:not(:first-child) {
			border-top: 3px solid color-mix(in srgb, #767676 60%, transparent);
			padding: 10px;
			margin: 0 -10px;
		}
	}

	.mod-name {
		justify-self: center;
		text-align: center;

		@media (width >= 1000px) {
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			align-items: center;
			justify-self: stretch;
			padding: 9px 0 16.8px;
		}

		h2 {
			margin-top: 0.375em;
			margin-bottom: 0.7em;

			@media (width >= 1000px) {
				grid-column: 2;
				margin: 0;
			}

			a {
				color: inherit;
			}
		}

		.remove-entry {
			@media (width >= 1000px) {
				grid-column: 3;
				justify-self: end;
				position: relative;
				top: -1.5px;
				margin: -2px 6px -1px 0;
				padding: 4.5px 12px 2.5px;
				font-size: 17px;
			}

			@media (width < 1000px) {
				margin-bottom: 0.7em;
			}
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

		input[type='checkbox'] {
			width: 20px;
			height: 20px;
			max-width: none;
		}
	}
</style>
