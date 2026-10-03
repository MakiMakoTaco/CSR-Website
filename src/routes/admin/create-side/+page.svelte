<script>
	let { form } = $props();

	let sideName = $state('A-Side');
	let tierData = $state([{ name: 'Bronze', mods: ['https://gamebanana.com/mods/332117'] }]);

	let processedMods = $state(0);

	let sideData = $state(null);

	let sideDataLoaded = $state(true);
	let loading = $state(false);

	let count = $derived(tierData.reduce((total, tier) => total + tier.mods.length, 0));

	$effect(() => {
		sideName;
		tierData;

		loadSideData();
	});

	async function getModData(value, index = 0) {
		try {
			const url = new URL(value);

			if (value.includes('https://gamebanana.com/')) {
				const newItem = value.replace('https://gamebanana.com/', '').split('/');

				const result = await fetch(`https://gamebanana.com/apiv11/Mod/${newItem[1]}/ProfilePage`);
				const jsonResult = await result.json();

				if (jsonResult._aGame._sName !== 'Celeste') {
					return { profilePage: value, name: value.replace(/https?:\/\/www./, ''), index };
				}

				// Get data: mod name, author, manual dowload, auto download
				const modData = {
					profilePage: value,
					index,
					name: jsonResult._sName,
					author: jsonResult._aSubmitter._sName,
					downloads: jsonResult._aFiles.map((file) => {
						return {
							name: file._sFile,
							size: file._nFilesize,
							manual: file._sDownloadUrl,
							everest: file._aModManagerIntegrations[0]._sDownloadUrl
						};
					})
				};

				return modData;
			} else {
				return { profilePage: value, name: value.replace(/https?:\/\/www./, ''), index };
			}
		} catch (error) {
			return { name: value, index };
		}
	}

	async function loadSideData() {
		loading = true;
		processedMods = 0;

		const tiers = await Promise.all(
			tierData.map(async (tier) => {
				const mods = await Promise.all(
					tier.mods.map(async (mod, modIndex) => {
						const modData = await getModData(mod, modIndex);
						processedMods++;
						return modData;
					})
				);

				return {
					name: tier.name,
					mods: mods.sort((a, b) => a.name.localeCompare(b.name))
				};
			})
		);

		sideData = {
			name: sideName,
			tiers
		};

		loading = false;
	}
</script>

<noscript>
	JavaScript must be enabled in order to create a new side. Creating a new side without JS will
	cause issues</noscript
>

{#if form?.error}
	{form.error}
{:else if form?.success}
	{#each form?.mods as mod}
		<p>{mod.name}</p>
	{/each}
{/if}

<form>
	<label for="side-name">Side Name:</label>
	<input name="side-name" bind:value={sideName} />

	<br />

	{#each tierData as tierName, i}
		<br />
		<label for="tier-name">Tier Name:</label>
		<input id="tier-name" placeholder="Tier Name" bind:value={tierData[i].name} required />

		<button
			onclick={(e) => {
				e.preventDefault();

				tierData.splice(i, 1);
			}}>Remove Tier</button
		>

		<label for="mod-links">Mod Links:</label>
		{#each tierData[i].mods as mod, j}
			<input
				name={tierData[i].name}
				id="mod-links"
				placeholder="Gamebanana Link"
				bind:value={tierName.mods[j]}
				required
			/>
		{/each}
		<button
			onclick={(e) => {
				e.preventDefault();

				tierData[i].mods.push('');
			}}>Add another mod</button
		>
	{/each}
	<button
		onclick={(e) => {
			e.preventDefault();

			tierData.push({ name: '', mods: [''] });
		}}>Add another tier</button
	>
</form>

{#await sideData}
	<p>Loading side data...</p>
{:then sideData}
	<form method="POST" action="?/submit">
		<p>Processed {processedMods}/{count}</p>

		{#if loading}
			<p>Loading side data...</p>
		{/if}

		{#if sideData}
			<input name="sideName" value={sideData.name} hidden="true" />
			<h1>{sideData.name}</h1>

			{#each sideData.tiers as tier, tierIndex}
				<input type="text" name="tiers" value={tier.name} hidden />
				<h2>{tierData[tierIndex].name}</h2>

				{#each tier.mods as mod}
					{#if mod.name}
						<div class="mod-data">
							<input type="text" name="{tier.name}-profilePage" value={mod.profilePage} hidden />
							{#if mod.profilePage}
								<a href={mod.profilePage} target="_blank">{mod.name}</a>
							{:else}
								<span style="color: yellow;">Entry is not a valid link</span>
							{/if}
							<input type="text" name="{tier.name}-name" value={mod.name} />
							<button
								onclick={async (e) => {
									e.preventDefault();

									tierData[tierIndex].mods.splice(mod.index, 1);
								}}>Remove Mod</button
							>
						</div>
					{/if}
				{/each}
			{/each}
		{/if}
		<button disabled={loading}>Create Side</button>
	</form>
{/await}

<style>
	noscript {
		font-size: 36px;
		font-weight: bold;
	}

	.mod-data > input {
		min-width: 100px;
		field-sizing: content;
	}
</style>
