<script>
	function formatBytes(bytes, decimals = 2) {
		if (!+bytes) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.mod.name} - CSR</title>
</svelte:head>

<h1>{data.mod.name}</h1>
<header>{data.mod.description}</header>

<br />

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
			{#each data.mod.downloads as download}
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

<br />

<div>
	<h3>Tags:</h3>
	{#each data.mod.tags as tag}
		<p>{tag}</p>
	{/each}
</div>

<br />

<div>
	<h3>About the mod:</h3>
	<p>{@html data.mod.text}</p>
</div>
