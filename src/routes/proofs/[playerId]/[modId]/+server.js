export async function GET({ platform, params, setHeaders }) {
	const filePath = `${params.playerId}/${params.modId}/`;

	const imageFolder = await platform.env.R2.list({ prefix: filePath });
	const images = imageFolder.objects.map((image) => ({
		name: image.key,
		size: image.size,
		uploaded: image.uploaded
	}));

	return Response.json(images);
}
