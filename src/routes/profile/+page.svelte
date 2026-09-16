<script>
	let { data, form } = $props();
	let { name, color, avatar, about } = $derived({
		name: data.player.name,
		color: `#${data.player.nameColor}`,
		avatar: data.player.avatar,
		about: data.player.about
	});
</script>

{#if form?.success}
	<dialog class="toast">Successfully updated player info</dialog>
{:else if form?.error}
	<div>Failed to update player data: {form?.message ?? 'Unable to find reason'}</div>
{/if}

<div id="update-player">
	<form method="POST" action="?/update">
		<label for="nameColor">Color:</label>
		<input name="nameColor" type="color" bind:value={color} />
		<br />
		<label for="name">Name:</label> <input name="name" bind:value={name} />
		<br />
		<label for="about">About Me:</label>
		<textarea name="about" bind:value={about}></textarea>

		<button>Update Profile</button>
	</form>
</div>

<div>
	<img class="profile-pic" alt="player" src={avatar} />
	<form action="/login/discord"><button>Reset avatar</button></form>
	<h1 style="color: {color};">{name}</h1>
	<p style="white-space: pre-wrap;">{about}</p>
</div>

<form method="POST" action="?/logout">
	<button>Sign out</button>
</form>

<style>
	.profile-pic {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		margin-top: 1%;
	}

	.toast {
		opacity: 0;
		display: grid;

		transition: opacity;
		transition-behavior: allow-discrete;
		transition-delay: 5s;
		transition-duration: 1s;

		@starting-style {
			opacity: 1;
		}
	}
</style>
