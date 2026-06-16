import { error, fail } from '@sveltejs/kit';

export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();
		return;

		let mods = [];

		for (const [key, value] of data) {
			console.log(key, value);
			if (value.includes('https://gamebanana.com/')) {
				const newItem = value.replace('https://gamebanana.com/', '').split('/');
				console.log(newItem);

				const result = await fetch(`https://gamebanana.com/apiv11/Mod/${newItem[1]}/ProfilePage`);
				const jsonResult = await result.json();

				if (jsonResult._aGame._sName !== 'Celeste') {
					return fail(406, { error: `${value} is not a valid Celeste mod` });
				}

				console.log(jsonResult);

				// Get data: mod name, author, manual dowload, auto download
				const modData = {
					name: jsonResult._sName,
					author: jsonResult._aSubmitter._sName,
					downloads: jsonResult._aFiles.map((file) => {
						return {
							name: file._sFile,
							size: file._nFilesize,
							manual: file._sDownloadUrl,
							everest: file._aModManagerIntegrations[0]._sDownloadUrl
						};
					})
				};

				mods.push(modData);

				console.log(modData);
			}
		}

		console.log('exiting successfully');
		return { success: true, mods };
	}
};
