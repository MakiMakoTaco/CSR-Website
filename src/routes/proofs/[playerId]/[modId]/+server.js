export async function GET({ platform, params, setHeaders }) {
	const filePath = `${params.playerId}/${params.modId}/`;

	const imageFolder = await platform.env.R2.list({ prefix: filePath, include: ['httpMetadata'] });
	const images = [];
	imageFolder.objects.map((image) => {
		if (image.httpMetadata?.contentType === 'image/webp') {
			images.push({
				name: image.key.split('.')[0],
				size: image.size,
				uploaded: image.uploaded
			});
		}
	});

	return Response.json(images);
}
