<!-- use the journal and flip page animation to see stats -->

<script>
	import { get } from 'svelte/store';

	let { data, form } = $props();
	let { name, color, avatar, about } = $derived({
		name: data.player.name,
		color: `#${data.player.nameColor}`,
		avatar: data.player.avatar,
		about: data.player.about
	});

	let apiKey = $state(0);

	async function getApiKey() {
		const response = await fetch('/profile/get-api-key', {
			method: 'POST'
		});
		const body = await response.json();
		apiKey = body.apiKey;
	}
</script>

<svelte:head>
	<title>Profile - CSR</title>
</svelte:head>

{#if form?.success}
	<dialog class="toast">Successfully updated player info</dialog>
{:else if form?.error}
	<div>Failed to update player data: {form?.message ?? 'Unable to find reason'}</div>
{/if}

<main>
	<!-- <button onclick={getApiKey} tabindex="0">Get an API Key</button>
	{#if apiKey}
		{apiKey}
	{/if} -->

	<div class="update-player">
		<a href="/login/discord">Reset avatar</a>
		<form method="POST" action="?/update">
			<div class="form-field">
				<label for="nameColor">Color:</label>
				<input name="nameColor" type="color" bind:value={color} />
			</div>
			<div class="form-field">
				<label for="name">Name:</label>
				<input name="name" minlength="1" maxlength="50" bind:value={name} />
			</div>
			<div class="form-field">
				<label for="about">About Me:</label>
				<textarea name="about" bind:value={about}></textarea>
			</div>

			<button>Update Profile</button>
		</form>
		<form class="logout" method="POST" action="?/logout">
			<button>Logout</button>
		</form>
	</div>

	<div class="preview">
		<img class="profile-pic" alt="player" src={avatar} />
		<h1 style="color: {color};">{name}</h1>
		<p class="about">{about}</p>
	</div>
</main>

<style>
	main {
		margin: 10px 50px;

		@media (width > 1000px) {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: 1fr;

			justify-items: center;
		}
	}

	.update-player {
		display: grid;
	}

	.form-field {
		margin: 1rem 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-width: 1fr;

		> * {
			field-sizing: content;
		}
		textarea {
			max-width: 50cqw;

			@media (width > 1000px) {
				max-width: 25cqw;
			}
		}
	}

	.logout {
		margin: 1rem;
		place-self: center;
	}

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

	.preview {
		container: test;

		p {
			/* text-wrap: wrap; */
			overflow-wrap: break-word;
			word-break: break-word;
			white-space: pre-line;
		}
	}
</style>
