import { error } from '@sveltejs/kit';

export async function GET({ platform, params }) {
	if (params.orderIndex < 1 || params.orderIndex > 4) {
		error(400, { message: 'Image cannot exist', details: 'Page number outside range (1-4)' });
	}

	const filePath = `${params.playerId}/${params.modId}/${params.orderIndex}`;

	const image = await platform.env.R2.get(filePath);
	if (!image) {
		error(400, { message: 'Image does not exist' });
	}
	if (!image.httpMetadata || image.httpMetadata?.contentType !== 'image/webp') {
		error(400, { message: 'Unexpected content type' });
	}

	return new Response(image.body);
}
