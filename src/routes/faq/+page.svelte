<svelte:head>
	<title>FAQ - CSR</title>
</svelte:head>

<main>
	<div class="what-is">
		<h1>What is CSR?</h1>
		<p>
			CSR is a list of Celeste maps, collabs and contests that you can play through at your own
			pace, & feel a sense of accomplishment once you beat them!
		</p>
		<p>
			Have you just started, interested in a good starting point to the world of Celeste maps? Are
			you a veteran searching for some hidden gems? There's something for every player in CSR!
		</p>
	</div>
	<div class="questions">
		<div class="submissions">
			<h1>How to Submit</h1>
			<p>
				If you are totally new to Celeste, you can download the mod loader <a
					href="https://everestapi.github.io/">here</a
				>!
			</p>
			<p>
				To submit your clears, just go to the Submit Mods page and search for a mod. Journal
				screenshots (uploaded to websites like imgur or prnt.sc) are most common and always
				accepted, however there's also the option to upload directly or use another site! You can
				even upload video links!
			</p>
			<p>
				When submitting multiple links as proof for a mod, please separate them with a space. If you
				instead upload images directly, please make sure they are less than 4MB, that there are no
				more than 4 images per mod and that they are of type .webp, .png or .jp(e)g.
			</p>
			<p>
				If you would like to attempt having files automatically placed into the correct mod after
				selecting an entire tier, please make sure that the folder selected follows a file structure
				of "selectedFolder/modName.png", or "selectedFolder/modName/multipleFiles.png" (or any other
				accepted file extension). Any characters that are in the mod name but not allowed in the
				file name, just leave out. If there's still issues feel free to come <a
					href="https://discord.gg/rVYhpeRX2u">let us know!</a
				>
			</p>
			<p>
				The only required data for submissions is the proof, along with the honor pledge. The clear
				date, death count, time taken, full clear checkbox, and notes section are all totally
				optional! Feel free to fill them out for your own personal stats!
			</p>
			<p>
				You might notice that when submitting mods, you can submit for mods you've already beaten.
				Currently, sending a submission to the already beaten mod will just replace whatever fields
				you fill out, along with setting an "update at" timestamp. You can also edit your own clears
				directly from the link to your profile in settings!
			</p>
			<p>
				If you encounter any issues when submitting please contact a mod or go to the Discord's help
				channel. If you receive a 4xx error, this will be fixed as soon as possible (we likely just
				forgot a line in the code.) If you receive a 500 error, then when you contact a moderator,
				they may tell you to do something different in the meantime if you don't want to wait for a
				fix.
			</p>
			<p>
				The Shrimp sheet is a collection of maps that did not make it onto the main CSR sheet. <a
					href="https://docs.google.com/spreadsheets/d/1ljc0gVIURrKP3qtStGnrcuBCSOE5P_R8jZZz7VQwN8U"
					>Check it out here</a
				>!
			</p>
		</div>
		<div class="start">
			<h1>Common Questions</h1>
			<h4>Q. Where should I start?</h4>
			<p>
				A. The Super-Side is a collection of 250 of the most polished mods from A-Side to E-Side; I
				highly recommend starting out there!
			</p>
			<h4>Q. What do the other sides mean?</h4>
			<p>
				A. The different sides under the "Sides" tab correspond to the year those mods were released
				in. B-Side for 2022, C-Side for 2023, and so on. DLCs are from the current year, and the
				Catstare sheet contains the GM+ maps.
			</p>
			<h4>Q. What counts as a clear?</h4>
			<p>
				A1. A clear is a clear, within reason. You can use savestates or toy with variants to
				practice a room, but you must eventually clear all rooms, front to back, properly. Clears of
				any date are also accepted!
			</p>
			<p>
				A2. You do not have to full clear maps unless it is listed as mandatory. (You still should
				try, though!)
			</p>
		</div>
	</div>
	<div class="credits">
		<h1>Credits</h1>
		<table>
			<tbody>
			    <tr>
					<td>Initial Design</td>
					<td>touhoe, Sienna</td>
				</tr>
				<tr>
					<td>Backend & Frontend</td>
					<td>Zelda</td>
				</tr>
				<tr>
					<td>Curation</td>
					<td>touhoe, Pazkallan</td>
				</tr>
				<tr>
					<td>Updates & Maintenance</td>
					<td>Pazkallan, Zelda, touhoe</td>
				</tr>
				<tr>
					<td>Testing & Feedback</td>
					<td>CSR Discord Server</td>
				</tr>
				<tr>
					<td>Font</td>
					<td>Arial</td>
				</tr>
				<tr>
					<td>Inspiration</td>
					<td>Fangame Skill Rating</td>
				</tr>
			</tbody>
		</table>
	</div>
</main>

<style>
	main {
		display: grid;
		gap: 1rem;
		margin: 1rem 50px;
		text-align: center;

		@media (width < 1130px) {
			margin: 1rem 15px;
		}
	}

	.questions {
		display: grid;
		gap: 1rem;
	}

	.what-is,
	.submissions,
	.start,
	.credits {
		box-sizing: border-box;
		width: 75%;
		margin: auto;
		padding: 0 1.5rem;
		border: 1px solid grey;
		border-radius: 1rem;

		@media (width < 1130px) {
			width: 100%;
			padding: 0 1rem;
		}
	}

	.credits {
		padding-bottom: 1rem;

		table {
			width: 100%;
			border-collapse: collapse;
			text-align: left;
		}

		td {
			width: 50%;
			padding: 0.75rem 1.5rem;
			border-bottom: 1px solid color-mix(in srgb, grey 60%, transparent);
		}

		@media (width < 1130px) {
			td {
				padding: 0.75rem 0.5rem;
			}
		}
	}

	.start {
		text-align: left;

		h1 {
			text-align: center;
		}
	}
</style>
