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

<a href="/sides/{mod.sideName}">Back to {mod.sideName}</a>
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
			<small style="font-size: 16px;"
				><a href="/mod-data/{mod.modDataId}" style="text-decoration: none;">data</a></small
			>
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
						{console.log(child.download)}
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
									{#if download.everestUrl}
										<a href={download.everestUrl}>Download</a>
									{:else}
										No Everest link available
									{/if}
								</td>
								<td>
									{#if download.manualUrl}
										<a href={download.manualUrl}>{download.fileName}</a>
									{:else}
										No link available
									{/if}
								</td>
								<td>{formatBytes(download.fileSize)}</td>
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
	main {
		padding: 0 10vw;
		text-align: center;
		display: grid;
		grid-template-areas:
			'title title'
			'description description'
			'downloads credits';
		grid-template-columns: 4fr 3fr;

		justify-content: center;
		gap: 2rem 4rem;
		margin: auto 15px;

		@media (width < 790px) {
			grid-template-areas: 'title' 'description' 'downloads' 'credits';
			grid-template-columns: 1fr;
		}

		> * {
			text-align: center;
		}
	}

	.title {
		grid-area: title;
	}

	.description {
		grid-area: description;
	}

	.downloads {
		grid-area: downloads;
		align-self: baseline;
	}

	.credits {
		grid-area: credits;
		width: 100%;
	}

	.credit-group {
		display: grid;

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
		table-layout: fixed;
		border-collapse: collapse;
		margin: 10px auto;
	}

	caption {
		font-size: 18px;
	}

	th,
	td {
		padding: 0.4em;
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
