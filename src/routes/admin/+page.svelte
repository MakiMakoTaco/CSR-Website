<svelte:head>
	<title>Admin Panel - CSR</title>
</svelte:head>

<button onclick={() => (location = '/admin/create-side')}>Create a Side</button>
<br />
<button onclick={() => (location = '/admin/edit-side')}>Edit a Side</button>
<br />
<button onclick={() => (location = '/admin/confirm-claims')}>Confirm player claims</button>
