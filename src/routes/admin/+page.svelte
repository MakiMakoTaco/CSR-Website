<svelte:head>
	<title>Admin Panel - CSR</title>
</svelte:head>

<main>
	<button onclick={() => (location = '/admin/create-side')}>Create a Side</button>
	<button onclick={() => (location = '/admin/edit-side')}>Edit a Side</button>
	<button onclick={() => (location = '/admin/confirm-claims')}>Confirm player claims</button>
</main>

<style>
	main {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		margin: 1.5rem 0;
	}

	button {
		padding: 5px 14px;
		font-size: 18px;
	}
</style>
