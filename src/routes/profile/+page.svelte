<!-- use the journal and flip page animation to see stats -->

<script>
	import { onMount } from 'svelte';

	let { data, form } = $props();
	let { name, nameColor, avatar, about } = $derived({
		name: data.player.name,
		nameColor: data.player.nameColor,
		avatar: data.player.avatar,
		about: data.player.about
	});
	let color = $derived(nameColor);

	$effect(() => {
		if (nameColor && !nameColor.includes('#')) {
			color = `#${nameColor}`;
		}
	});

	onMount(() => {
		if (nameColor && !nameColor.includes('#')) {
			nameColor = `#${nameColor}`;
		}
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
	<div>{form?.error}</div>
{/if}

<main>
	<!-- <button onclick={getApiKey} tabindex="0">Get an API Key</button>
	{#if apiKey}
		{apiKey}
	{/if} -->

	<div class="preview">
		<img class="profile-pic" alt="player" src={avatar} />
		<h1 style="color: {nameColor};">{name}</h1>
		<p class="about">
			{#if about}About me: {about}{/if}
		</p>
	</div>

	<div class="update-player">
		<button class="reset-avatar" onclick={() => (location = '/login/discord')}>Reset Avatar</button>
		<form method="POST" action="?/update">
			<div class="form-field">
				<label for="nameColor">Color:</label>
				<div class="color-picker">
					<input type="text" name="nameColor" bind:value={nameColor} />
					<input type="color" value={color} onchange={(nameColor = this.value)} />
				</div>
			</div>
			<div class="form-field">
				<label for="name">Name:</label>
				<input name="name" minlength="1" maxlength="50" bind:value={name} />
			</div>
			<div class="form-field">
				<label for="about">About Me:</label>
				<textarea name="about" maxlength="1000" bind:value={about}></textarea>
			</div>
			<div class="private-stats">
				<label>
					<input type="checkbox" name="privateStats" checked={data.player.privateStats} />
					Private Optional Stats
				</label>
				<p>
					Only you will be able to view your optional stats: death count, time taken, full clear
					status, and personal notes!
				</p>
			</div>

			<div class="form-buttons">
				<button>Update Profile</button>
				<button type="button" onclick={() => (location = `/players/${data.player.id}`)}
					>View Your Profile</button
				>
			</div>
		</form>
		<form class="logout" method="POST" action="?/logout">
			<button>Logout</button>
		</form>
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
		align-self: start;
		padding: 1rem;
		border: 1px solid grey;
		border-radius: 1rem;
	}

	.form-field {
		margin: 1rem 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-width: 1fr;

		> * {
			field-sizing: content;
			min-width: 0;
			max-width: 100%;
		}
		textarea {
			max-width: 50cqw;

			@media (width > 1000px) {
				max-width: 25cqw;
			}
		}
	}

	.color-picker {
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
	}

	.reset-avatar {
		justify-self: start;
	}

	.form-buttons {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;

		@media (width <= 1000px) {
			flex-direction: column;
			align-items: center;
		}

		button {
			width: 10.5em;
		}
	}

	.private-stats {
		margin-bottom: 1rem;

		p {
			margin: 0.25rem 0 0;
			font-size: 14px;
			color: grey;
		}
	}

	.logout {
		margin: 1rem;
		place-self: center;
	}

	form button {
		padding: 5px 14px;
		font-size: 18px;
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
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		align-self: start;
		gap: 0 1rem;

		p {
			/* text-wrap: wrap; */
			overflow-wrap: break-word;
			word-break: break-word;
			white-space: pre-line;
			flex-basis: 100%;
		}
	}
</style>
