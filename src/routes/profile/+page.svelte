<script>
	let { data } = $props();
	let { name, color, avatar, about } = $derived({
		name: data.player.name,
		color: data.player.nameColor,
		avatar: data.player.avatar,
		about: data.player.about
	});
</script>

<div>
	<img class="profile-pic" alt="player" src={avatar} />
	<h1 style="color: {color};">Name: {name}</h1>
</div>

<div>
	<form method="POST">
		<label for="about-me">About Me:</label>
		<input id="about-me" name="about" value={about} />
	</form>
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
