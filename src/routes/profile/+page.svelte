<script>
	let { data } = $props();
	let { name, color, avatar, about } = $derived({
		name: data.player.name,
		color: data.player.nameColor,
		avatar: data.player.avatar,
		about: data.player.about
	});
</script>

<p>There is currently no backend for this page so none of these fields will get updated</p>

<div>
	<label for="player-color">Color:</label>
	<input name="player-color" type="color" bind:value={color} />
	<br />
	<label for="player-name">Name:</label> <input name="player-name" bind:value={name} />
	<br />
	<label for="player-about">About Me:</label>
	<input name="player-about" bind:value={about} />
</div>

<div>
	<img class="profile-pic" alt="player" src={avatar} />
	<form action="/login/discord"><button>Reset avatar</button></form>
	<h1 style="color: {color};">{name}</h1>
	<p>{@html about}</p>
</div>

<form method="POST">
	<button>Sign out</button>
</form>

<style>
	.profile-pic {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		margin-top: 1%;
	}
</style>
