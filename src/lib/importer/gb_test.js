import fs from 'fs';
import { unzipSync, strFromU8 } from 'fflate';

// const downloadUrl = 'https://gamebanana.com/apiv11/File/1414214';
// const result = await fetch(downloadUrl);

// const json = await result.json();

// const languages = Object.keys(json._aArchiveFileTree.Dialog).length;
// const maps = Object.keys(json._aArchiveFileTree.Maps)[0].length;

// console.log(languages, maps);

const input = 'https://gamebanana.com/dl/1539722';
// const input = 'https://drive.google.com/uc?export=download&id=1KhVFlc2d0PDE_ceimGwzd-iaRuSwrfuY';

const zip = await fetch(input).then((r) => r.arrayBuffer());

const files = unzipSync(new Uint8Array(zip));

const SIDs = [];
Object.keys(files).forEach((file) => {
	if (file.match(/Maps\/(.+?)\.bin/)) {
		SIDs.push(
			file
				.match(/Maps\/(.+?)\.bin/)[1]
				.replaceAll('/', '_')
				.replaceAll('-', '_')
		);
	}
});

const dialog = files['Dialog/English.txt'];

if (dialog) {
	const maps = [];
	SIDs.forEach((match) => {
		const reg = new RegExp(`(?<=${match}= *\\r?\\n?).+`, 'i');

		const text = strFromU8(dialog);
		let map = text.match(reg)?.[0];

		maps.push(map.trim());
	});

	fs.writeFile(
		'/home/zelda/Documents/Code/CSR Website/src/lib/importer/test6.txt',
		maps.join('\n'),
		(err) => {
			if (err) {
				console.error(err);
			} else {
				console.log('Successfully written file');
			}
		}
	);
} else {
	console.log('Could not find file');
}
