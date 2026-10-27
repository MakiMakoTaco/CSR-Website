import { SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET } from '$env/static/private';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';
import { fetchPlayer, hashApiKey } from '$lib/api/key.js';
import { error } from '@sveltejs/kit';
import { timingSafeEqual } from 'crypto';

const limiter = new RetryAfterRateLimiter({
	IP: [5, 'm']
});

export async function POST(event) {
	const { platform, locals, fetch, request, getClientAddress } = event;
	const sql = locals.sql;

	const status = await limiter.check(event);
	if (status.limited) {
		return Response.json(
			{ message: `Too many requests. Please try again after ${status.retryAfter} seconds` },
			{
				status: 429,
				statusText: 'Rate Limited',
				headers: { 'Retry-After': status.retryAfter.toString() }
			}
		);
	}

	const authHeader = request.headers.get('Authorization');
	if (
		!authHeader ||
		!authHeader.split(' ')[1] ||
		authHeader.split(' ')[0].toLowerCase() !== 'apikey'
	) {
		error(401, {
			message: 'An API key must be provided with the ApiKey prefix'
		});
	}

	if (authHeader.split(' ').length > 2) {
		error(401, {
			message: 'Too many values in Authorization header'
		});
	}

	const apiKey = authHeader.split(' ')[1];
	if (apiKey.length !== 24) {
		error(401, {
			message: 'Invalid API key length'
		});
	}

	const id = apiKey.substring(0, 8);
	const key = await hashApiKey(apiKey.substring(8));

	const requestedPlayer = await fetchPlayer(sql, id);
	if (!requestedPlayer || !requestedPlayer.hashedSecret || !requestedPlayer.player) {
		error(401, {
			message: 'Invalid API key'
		});
	}

	const { hashedSecret, player } = requestedPlayer;
	const validKey = timingSafeEqual(Buffer.from(key), Buffer.from(hashedSecret));

	if (!validKey) {
		error(401, {
			message: 'Invalid API key'
		});
	}

	const form = await request.formData();
	const images = form.getAll('proof');

	if (images.length > 4) {
		error(400, {
			message: 'Too many files',
			details: 'Max of 4 images per submission allowed'
		});
	}

	const allowedTypes = ['image/webp', 'image/png', 'image/jpeg'];
	images.forEach((image) => {
		if (!allowedTypes.includes(image.type)) {
			error(400, {
				message: 'Incorrect file type(s) provided',
				details: 'File must be of type WebP, PNG or JPEG'
			});
		}

		if (image.size > 1000 * 1000 * 4) {
			error(400, {
				message: 'File size(s) too large',
				details: 'File must be smaller than 4MB'
			});
		}

		if (image.type === 'image/webp' && image.size > 1000 * 130) {
			error(400, {
				message: 'File size(s) too large for webp limit',
				details: 'WebP files must be smaller than 130KB'
			});
		}
	});

	// const sightengineData = new FormData();
	// images.forEach((image) => {
	// 	sightengineData.append('media[]', image);
	// });
	// sightengineData.append('models', 'nudity-2.1,people-counting,type');
	// sightengineData.append('api_user', SIGHTENGINE_API_USER);
	// sightengineData.append('api_secret', SIGHTENGINE_API_SECRET);

	// const response = await fetch('https://api.sightengine.com/1.0/check.json', {
	// 	method: 'POST',
	// 	body: sightengineData
	// });

	// const sightengineBody = await response.json();
	// if (sightengineBody.status === 'failure') {
	// 	console.error(sightengineBody.error);
	// 	error(400, {
	// 		message: 'Sightengine error'
	// 	});
	// }
	// if (images.length > 1) {
	// 	sightengineBody.data.forEach((imageResult) => {
	// 		if (
	// 			imageResult.nudity.none !== 0.99 ||
	// 			imageResult['people-counting']['0'] !== 0.99 ||
	// 			imageResult.type.illustration < 0.95
	// 		) {
	// 			error(422, {
	// 				message: 'Image failed moderation checks'
	// 			});
	// 		}
	// 	});
	// } else if (
	// 	sightengineBody.nudity.none !== 0.99 ||
	// 	sightengineBody['people-counting']['0'] !== 0.99 ||
	// 	sightengineBody.type.illustration < 0.95
	// ) {
	// 	error(422, {
	// 		message: 'Image failed moderation checks'
	// 	});
	// }

	// const uploads = images.map(async (image, index) => {
	// 	let bytes;

	// 	if (image.type !== 'image/webp') {
	// 		const transformed = (
	// 			await platform.env.IMAGES.input(image.stream()).output({ format: 'image/webp' })
	// 		).response();

	// 		bytes = await transformed.arrayBuffer();
	// 	} else {
	// 		bytes = await image.arrayBuffer();
	// 	}

	// 	console.log(bytes);

	// 	const fileName = `3/1/proof${images.length > 1 ? `-${index + 1}` : ''}.webp`;
	// 	await platform.env.R2.put(fileName, bytes, {
	// 		httpMetadata: { contentType: 'image/webp' }
	// 	});
	// });

	// await Promise.all(uploads);

	return Response.json({ message: 'Passed checks' });
}
