<script>
	import { goto } from '$app/navigation';
</script>

<main>
	<div class="content">
		<div class="claim-player">
			<button onclick={goto('/claim-player')}
				>Claim an existing player from the Google Sheets</button
			>
		</div>
		<!-- <div class="new-player">
			<button onclick={goto('/profile')}>Create a new player</button>
		</div> -->
	</div>
</main>
