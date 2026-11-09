<div id="sign-in">
	<h1>Sign in</h1>
	<button class="discord-login" onclick={() => (location.href = '/login/discord')}
		><img src="/assets/discord.svg" alt="discord icon" />Sign in with Discord</button
	>
</div>

<style>
	#sign-in {
		text-align: center;
	}

	.discord-login {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		padding: 6px 14px;
		font-size: 18px;

		img {
			height: 1.2em;
		}
	}
</style>
