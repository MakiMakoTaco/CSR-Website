export async function PATCH({ locals }) {
	console.log(`Attempting to update API key for ${locals.player.name}`);

	return Response.json(5);
}
