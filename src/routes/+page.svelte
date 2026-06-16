<script>
	let { data } = $props();
</script>

<title>Welcome! - CSR</title>

<div><p>Welcome to the Celeste Skill Rating!</p></div>
<div>
	<table class="sides-info">
		<thead>
			<tr>
				<th>Side</th>
				<th>Total Clears</th>
				<th>Unique Players</th>
			</tr>
		</thead>
		<tbody>
			{#each data.sides as side}
				{#if side.type === 'standard'}
					<tr>
						<td><a href="/sides/{side.name}">{side.name}</a></td>
						<td>{side.clearCount}</td>
						<td>{side.uniquePlayers}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
		<thead><tr><th>DLC & Catstare</th></tr></thead>
		<tbody>
			{#each data.sides as side}
				{#if (side.type === 'catstare' || side.type === 'dlc') && !side.archived}
					<tr>
						<td><a href="/sides/{side.name}">{side.name}</a></td>
						<td>{side.clearCount}</td>
						<td>{side.uniquePlayers}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
		<thead><tr><th>Archived</th></tr></thead>
		<tbody>
			{#each data.sides as side}
				{#if side.archived}
					<tr>
						<td><a href="/sides/{side.name}">{side.name}</a></td>
						<td>{side.clearCount}</td>
						<td>{side.uniquePlayers}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
<div>
	<a href="/feedback">Leave Feedback</a>
	<br />
	<h2>Recent Feedback</h2>
	<table>
		<thead>
			<tr>
				<th>Feedback</th>
				<th>Player</th>
			</tr>
		</thead>
		<tbody>
			<!-- <?php foreach ($recentFeedback as $feedback): ?>
                    <tr>
                        <td><?= htmlspecialchars($feedback['content']) ?></td>
                        <td><?= htmlspecialchars($feedback['player_name']); ?></td>
                    </tr>
                <?php endforeach; ?> -->
		</tbody>
	</table>
</div>
<div>
	<h2>
		Recent Changes
		<table>
			<thead>
				<tr>
					<th>Change</th>
					<th>Created At</th>
				</tr>
			</thead>
			<tbody>
				<!-- <?php foreach ($recentChanges as $change): ?>
                    <tr>
                        <td><?= htmlspecialchars($change['content']) ?></td>
                        <td><?= htmlspecialchars($change['created_at']) ?></td>
                    </tr>
                <?php endforeach; ?> -->
			</tbody>
		</table>
	</h2>
</div>
