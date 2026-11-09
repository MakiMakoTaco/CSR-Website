<script>
	import { page } from '$app/state';
	const id = page.params.id;

	function formatBytes(bytes, decimals = 2) {
		if (!+bytes) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	let { data } = $props();
	let mod = $derived(data.mod);
	let submitter = $derived(mod.submitter);
</script>

<svelte:head>
	<title>{mod.name} - CSR</title>
</svelte:head>

<button class="back" onclick={() => (location = `/sides/${mod.sideName}`)}
	>Back to {mod.sideName}</button
>
{#if page.url.searchParams.get('player')}
	<button
		class="back return"
		onclick={() => (location = `/players/${page.url.searchParams.get('player')}`)}
		>Return to Player</button
	>
{/if}
<main>
	<div class="title">
		<h1>
			<a href={mod.page} target="_blank">
				{mod.name}
			</a>
			{#if submitter}
				<small
					>by
					{#if submitter.profileUrl}
						<a href="/contributors/{submitter.id}">{submitter.name}</a>
					{:else}
						{submitter.name}
					{/if}
				</small>
			{/if}
			<!-- <small style="font-size: 16px;"
				><a href="/mod-data/{mod.modDataId}" style="text-decoration: none;">data</a></small
			> -->
		</h1>
		<div class="clears">
			<a href="{id}/clears">view {data.clears} clears</a>
		</div>
	</div>
	<div class="description">{data.mod.description}</div>

	<div class="downloads">
		{#if mod.children && mod.children.length > 0}
			<div class="children">
				{#each mod.children as child}
					<span>
						<a href="/mod-data/{child.id}">{child.gbName}</a>
						<a href={child.download?.everest.everestUrl}>Quick Install</a>
					</span>
				{/each}
			</div>
		{:else}
			<div class="download-links">
				<table>
					<caption>Download Links</caption>
					<thead>
						<tr>
							<th>Everest</th>
							<th>Manual</th>
							<th>File Size</th>
						</tr>
					</thead>
					<tbody>
						{#each mod.downloads as download}
							<tr>
								<td>
									{#if download.everest}
										<a href={download.everest}>Download</a>
									{:else}
										No Everest link available
									{/if}
								</td>
								<td>
									{#if download.manual}
										<a href={download.manual}>{download.name}</a>
									{:else}
										No link available
									{/if}
								</td>
								<td>{formatBytes(download.size)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
	<div class="credits">
		{#each mod.credits as creditGroup}
			<div class="credit-group">
				<h2 class="credit-group-title">{creditGroup.name}</h2>
				<div>
					{#each creditGroup.authors as author}
						<div>
							<p>{author.name}</p>
							{#if author.roleName}
								<small>{author.roleName}</small>
							{/if}
						</div>
					{/each}
				</div>
			</div>
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

	main {
		width: 80vw;
		text-align: center;
		display: grid;
		grid-template-areas:
			'title title'
			'description description'
			'downloads credits';
		grid-template-columns: 1fr 1fr;

		justify-content: center;
		margin: 0 auto 1rem;
		border: 1px solid grey;
		border-radius: 1rem;

		@media (width < 1000px) {
			width: 95vw;
		}

		@media (width < 790px) {
			grid-template-areas: 'title' 'description' 'downloads' 'credits';
			grid-template-columns: minmax(0, 1fr);
		}

		> * {
			text-align: center;
			padding: 1rem;
		}
	}

	.back {
		margin: 1rem 15px;
	}

	.return {
		float: right;
	}

	.title {
		grid-area: title;
	}

	.description {
		grid-area: description;
		border-bottom: 1px solid color-mix(in srgb, grey 60%, transparent);
	}

	.downloads {
		grid-area: downloads;
		align-self: stretch;
		padding: 0;
		overflow: hidden;
		border-right: 1px solid color-mix(in srgb, grey 60%, transparent);

		@media (width < 790px) {
			border-right: 0;
			border-bottom: 1px solid color-mix(in srgb, grey 60%, transparent);
		}
	}

	.credits {
		grid-area: credits;
		box-sizing: border-box;
		width: 100%;
		padding: 0;
	}

	.credit-group {
		display: grid;
		padding: 1rem;

		& + .credit-group {
			border-top: 1px solid color-mix(in srgb, grey 60%, transparent);
		}

		.credit-group-title {
			grid-column: 1 / -1;
			margin-bottom: 10px;
		}

		> div {
			display: grid;
			gap: 1rem;
			padding-bottom: 10px;
			grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
		}

		p {
			margin: 0;
		}
	}

	table {
		border-collapse: collapse;
		width: 100%;

		@media (width >= 790px) {
			margin-bottom: -1px;
		}
	}

	caption {
		font-size: 18px;
		font-weight: bold;
		padding: 1rem;
		border-bottom: 1px solid color-mix(in srgb, grey 60%, transparent);
	}

	tbody tr {
		border-top: 1px solid color-mix(in srgb, grey 60%, transparent);

		&:last-child {
			@media (width >= 790px) {
				border-bottom: 1px solid color-mix(in srgb, grey 60%, transparent);
			}
		}
	}

	th,
	td {
		padding: 0.5rem;
	}

	td:nth-child(2) {
		overflow-wrap: anywhere;
	}

	.clears {
		font-size: 24px;
	}

	.children {
		display: grid;
		padding: 2rem;
		gap: 0.5rem;

		a {
			text-decoration: none;
		}

		span {
			display: grid;
			width: 100%;
			gap: 2rem;
			grid-auto-flow: column;

			> :first-child {
				text-align: start;
			}

			> :last-child {
				text-align: end;
			}
		}
	}
</style>
