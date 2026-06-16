<script>
	let { form } = $props();

	let sideName = $state('A-Side');
	let tierData = $state([{ name: 'Bronze', mods: ['Test'] }]);

	let processedMods = $state(0);

	let sideData = $state(null);

	let sideDataLoaded = $state(true);
	let loading = $state(false);

	let count = $derived(tierData.reduce((total, tier) => total + tier.mods.length, 0));

	$effect(() => {
		console.log('Mounted/Changed');
		sideName;
		tierData;

		loadSideData();
	});

	async function getModData(value, index = 0) {
		if (value.includes('https://gamebanana.com/')) {
			const newItem = value.replace('https://gamebanana.com/', '').split('/');
			console.log(newItem);

			const result = await fetch(`https://gamebanana.com/apiv11/Mod/${newItem[1]}/ProfilePage`);
			const jsonResult = await result.json();

			if (jsonResult._aGame._sName !== 'Celeste') {
				return fail(406, { error: `${value} is not a valid Celeste mod` });
			}

			console.log(jsonResult);

			// Get data: mod name, author, manual dowload, auto download
			const modData = {
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

		<label for="mod-data">Mod Data:</label>
		{#each tierData[i].mods as mod, j}
			<input
				name={tierData[i].name}
				id="mod-data"
				placeholder="Gamebanana Link"
				bind:value={tierName.mods[j]}
				required
			/>
		{/each}
		<button
			onclick={(e) => {
				e.preventDefault();

				tierData[i].mods.push('');

				console.log(sideData);
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
			<input name="side-name" value={sideData.name} hidden="true" />
			<h1>{sideData.name}</h1>

			{#each sideData.tiers as tier, tierIndex}
				<h2>{tierData[tierIndex].name}</h2>

				{#each tier.mods as mod}
					<input name={tierData[tierIndex].name} value="test" hidden="true" />
					<p>
						{mod.name}
						<button
							onclick={async (e) => {
								e.preventDefault();

								tierData[tierIndex].mods.splice(mod.index, 1);
							}}>Remove Mod</button
						>
					</p>
				{/each}
			{/each}
		{/if}
		<button disabled={loading}>Create Side</button>
	</form>
{/await}
