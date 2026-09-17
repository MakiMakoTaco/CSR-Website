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

<main class="content">
	<div class="title">
		<h1>
			<a href={mod.page} target="_blank">
				{mod.name}
			</a>
			{#if submitter}
				<small
					>by
					{#if submitter.profile_url}
						<a href="/contributors/{submitter.id}">{submitter.name}</a>
					{:else}
						{submitter.name}
					{/if}
				</small>
			{/if}
			<small style="font-size: 16px;"
				><a href="/mod-data/{mod.mod_data_id}" style="text-decoration: none;">data</a></small
			>
		</h1>
		<div class="clears">
			<a href="{id}/clears">view {data.clears} clears</a>
		</div>
	</div>

	<div class="downloads">
		{#if mod.children && mod.children.length > 0}
			<div class="children">
				{#each mod.children as child}
					<span>
						{console.log(child.download)}
						<a href="/mod-data/{child.id}">{child.gb_name}</a>
						<a href={child.download?.everest.everest_url}>Quick Install</a>
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
									{#if download.everest_url}
										<a href={download.everest_url}>Download</a>
									{:else}
										No link available
									{/if}
								</td>
								<td>
									{#if download.manual_url}
										<a href={download.manual_url}>{download.file_name}</a>
									{:else}
										No Everest link available
									{/if}
								</td>
								<td>{formatBytes(download.file_size)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
	<div class="description">{data.mod.description}</div>
</main>

<style>
	main {
		display: grid;
		justify-content: center;
		gap: 1rem;

		> * {
			place-self: center;
			text-align: center;
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
