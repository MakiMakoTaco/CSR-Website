<script>
	let { data } = $props();

	const image = $derived(new Blob([data.file], { type: 'image/jpeg' }));
	const proof = $derived(URL.createObjectURL(image));
</script>

<img src={image} alt="player proof" />
