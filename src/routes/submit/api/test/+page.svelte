<script>
	let apiKey = $state('');
	let image = $state();
	let imagePreview = $state();
	let showImage = $state(false);
	let testResult = $state();

	function onChange() {
		const file = image[0];

		if (file) {
			showImage = true;

			const reader = new FileReader();

			reader.addEventListener('load', () => {
				imagePreview.setAttribute('src', reader.result);
			});
			reader.readAsDataURL(file);

			return;
		}

		showImage = false;
	}

	async function uploadFile() {
		const dataArray = new FormData();
		for (const file of image) {
			dataArray.append('proof', file);
		}

		const response = await fetch('/api/submissions/upload', {
			method: 'POST',
			body: dataArray,
			headers: {
				Authorization: `ApiKey ${apiKey}`
			}
		});
	}
</script>

<input type="text" bind:value={apiKey} />
<input
	type="file"
	name="proof"
	alt="proof image"
	accept="image/webp, image/png, image/jpeg"
	bind:files={image}
	onchange={onChange}
	multiple
/>
<button
	onclick={async () => {
		uploadFile();
	}}>Submit screenshot</button
>

<div style="width: 500px;">
	{#if showImage}
		<img bind:this={imagePreview} src="" alt="Preview" style="width: 100%;" />
	{:else}
		<span>Image Preview</span>
	{/if}
</div>

{#if testResult}
	{console.log(testResult)}
	{testResult}
{/if}
