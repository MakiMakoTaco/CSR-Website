<script>
	import { page } from '$app/state';

	let { data } = $props();
</script>

{#if !data.imageUrls || data.imageUrls.length < 1}
	Player does not have any images uploaded
{:else}
	{console.log(data.imageUrls)}
	<div class="images">
		{#each data.imageUrls as url, orderIndex}
			<div class="image-container">
				<a href={url} target="_blank">
					<img src={url} alt="player proof" />
				</a>
			</div>
		{/each}
	</div>
{/if}

<style>
	.images {
		display: grid;
	}

	.image-container {
		justify-self: center;
		width: calc(100vw - 100px);
		padding: 1rem;

		img {
			width: 100%;
		}
	}
</style>
