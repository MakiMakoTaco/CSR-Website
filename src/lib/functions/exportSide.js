const black = 'FF000000';
const white = 'FFFFFFFF';
const linkBlue = 'FF1155CC';
const thin = { style: 'thin', color: { argb: black } };
const thinWhite = { style: 'thin', color: { argb: white } };
const medium = { style: 'medium', color: { argb: black } };
const thick = { style: 'thick', color: { argb: black } };

function argb(hex) {
	return `FF${(hex ?? 'ffffff').toUpperCase()}`;
}

function darken(hex, amount) {
	return [0, 2, 4]
		.map((i) =>
			Math.round(parseInt((hex ?? 'ffffff').slice(i, i + 2), 16) * (1 - amount))
				.toString(16)
				.padStart(2, '0')
		)
		.join('');
}

function hyperlink(url, text) {
	return { formula: `HYPERLINK("${url}","${text.replace(/"/g, '""')}")`, result: text };
}

function fill(color) {
	return { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
}

function conditionalFill(color, fontColor) {
	return {
		fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: color } },
		...(fontColor ? { font: { color: { argb: fontColor } } } : {})
	};
}

function getSections(side) {
	if (side.showTierNames) {
		return side.tiers.map((tier) => {
			const catstare = tier.name.startsWith('Catstare');

			return {
				name: tier.name,
				clearsForRank: tier.clearsForRank,
				catstare,
				color: catstare ? black : argb(tier.colorPlus),
				partialColor: catstare ? 'FF666666' : argb(tier.color),
				mods: tier.mods.map((mod) => ({ ...mod, color: catstare ? black : argb(tier.color) }))
			};
		});
	}

	const catstare = side.name.startsWith('Catstare');

	return [
		{
			name: side.name,
			clearsForRank: side.clearsForRank,
			catstare,
			color: catstare ? black : argb(darken(side.color, 0.1)),
			partialColor: catstare ? 'FF666666' : argb(side.color),
			mods: side.tiers.flatMap((tier) =>
				tier.mods.map((mod) => ({
					...mod,
					color: catstare || tier.name.startsWith('Catstare') ? black : argb(tier.color)
				}))
			)
		}
	];
}

export async function exportSide(side, playerName) {
	const ExcelJS = (await import('exceljs')).default;

	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet(side.name.replace(/[[\]:*?/\\]/g, '').slice(0, 31), {
		views: [{ state: 'frozen', xSplit: 1, ySplit: 3 }],
		properties: { defaultColWidth: 12.63, defaultRowHeight: 15.75 }
	});

	sheet.getColumn(1).width = 50.13;
	sheet.getColumn(2).width = 17.63;

	const center = { horizontal: 'center', vertical: 'middle' };
	const centerWrap = { ...center, wrapText: true };

	sheet.getRow(1).height = 45;
	sheet.getRow(2).height = 33.75;
	sheet.getRow(3).height = 35.25;

	[1, 2, 3].forEach((row) => (sheet.getRow(row).fill = fill(white)));

	Object.assign(sheet.getCell('A1'), {
		value: 'Celeste Skill Rating Tracker',
		font: { name: 'Montserrat', size: 20, bold: true, color: { theme: 1 } },
		fill: fill('FFD0E0E3'),
		alignment: centerWrap,
		border: { left: thin, right: thick, top: thin, bottom: thin }
	});

	sheet.mergeCells('B1:D1');
	Object.assign(sheet.getCell('B1'), {
		value: { text: 'Celeste Skill Rating Discord', hyperlink: 'https://discord.gg/rVYhpeRX2u' },
		font: { name: 'Arial', size: 20, bold: true, color: { argb: 'FF4285F4' } },
		fill: fill(white),
		alignment: center,
		border: { right: thin, top: thin, bottom: thin }
	});

	sheet.mergeCells('E1:F1');
	Object.assign(sheet.getCell('E1'), {
		value: { text: 'Submission Form', hyperlink: `${location.origin}/submit` },
		font: { name: 'Arial', size: 20, bold: true, color: { argb: 'FF4285F4' } },
		fill: fill(white),
		alignment: center,
		border: { left: thin, right: thin, top: thin, bottom: thin }
	});

	sheet.mergeCells('G1:K1');
	Object.assign(sheet.getCell('G1'), {
		value: 'Special Thanks to Eevee, Sienna, Natalie, Kosheen, & Eeva',
		font: { name: 'Arial', size: 18, bold: true },
		fill: fill(white),
		alignment: center,
		border: { left: thin, right: thin, top: thin, bottom: thin }
	});

	Object.assign(sheet.getCell('A2'), {
		value: 'Celeste Custom Maps',
		font: { name: 'Arial', size: 18, bold: true },
		fill: fill('FFA2C4C9'),
		alignment: center,
		border: { left: thin, right: thick, top: thin, bottom: thin }
	});

	Object.assign(sheet.getCell('B2'), {
		value: playerName ?? 'Player',
		font: { name: 'Arial', size: 14, bold: true },
		fill: fill(white),
		alignment: center,
		border: { right: thin, top: thin, bottom: thin }
	});

	const sections = getSections(side);
	const totalMods = sections.reduce((total, section) => total + section.mods.length, 0);

	Object.assign(sheet.getCell('A3'), {
		value: `${side.name} Clears (Out of ${totalMods})`,
		font: { name: 'Arial', size: 18, bold: true },
		fill: fill('FFA2C4C9'),
		alignment: center,
		border: { left: thin, right: thick, top: thin, bottom: thin }
	});

	const totalCells = [];
	let totalClears = 0;
	let row = 4;

	sections.forEach((section) => {
		const fontColor = section.catstare ? white : black;

		sheet.getRow(row).height = 33.75;
		sheet.getRow(row).fill = fill(section.color);
		Object.assign(sheet.getCell(row, 1), {
			value: section.clearsForRank
				? hyperlink(
						'https://gamebanana.com/tools/21641',
						`${section.name} Challenges - Clear Any ${section.clearsForRank}`
					)
				: `${section.name} Challenges`,
			font: {
				name: 'Arial',
				size: side.name.startsWith('Catstare') ? 14 : 17,
				bold: true,
				color: { argb: fontColor }
			},
			fill: fill(section.color),
			alignment: center,
			border: section.catstare
				? { left: medium, right: thinWhite, top: medium, bottom: thinWhite }
				: { left: medium, right: medium, bottom: medium }
		});
		Object.assign(sheet.getCell(row, 2), {
			fill: fill(section.color),
			alignment: center
		});
		row++;

		const firstModRow = row;
		let clears = 0;

		section.mods.forEach((mod) => {
			sheet.getRow(row).height = 22.5;

			const nameCell = sheet.getCell(row, 1);
			Object.assign(nameCell, {
				value: hyperlink(`${location.origin}/mods/${mod.id}`, mod.name),
				font: {
					name: 'Arial',
					size: 14,
					bold: true,
					color: { argb: mod.color === black ? white : linkBlue }
				},
				fill: fill(mod.color),
				alignment: centerWrap,
				border:
					mod.color === black
						? { right: thinWhite, bottom: thinWhite }
						: { left: thin, right: medium, top: thin, bottom: thin }
			});

			if (mod.notes) {
				nameCell.note = mod.notes;
			}

			Object.assign(sheet.getCell(row, 2), {
				value: mod.cleared ? 'Clear!' : null,
				font: { name: 'Arial', size: 14 },
				alignment: center
			});

			if (mod.cleared) clears++;
			row++;
		});

		sheet.getRow(row).height = 22.5;
		Object.assign(sheet.getCell(row, 1), {
			value: `${section.name} Total (Out of ${section.mods.length})`,
			font: { name: 'Arial', size: 14, bold: true, color: { argb: fontColor } },
			fill: fill(section.color),
			alignment: centerWrap,
			border: section.catstare
				? { left: medium, right: thinWhite, bottom: medium }
				: { left: medium, right: medium, top: medium, bottom: medium }
		});

		const totalCell = `B${row}`;
		Object.assign(sheet.getCell(totalCell), {
			value: {
				formula: section.mods.length ? `COUNTA(B${firstModRow}:B${row - 1})` : '0',
				result: clears
			},
			font: { name: 'Arial', size: 14, bold: true },
			alignment: center
		});

		const rules = [
			{
				type: 'expression',
				formulae: ['ISBLANK(B$2)'],
				style: conditionalFill(white, white)
			}
		];

		if (section.clearsForRank && section.clearsForRank < section.mods.length) {
			rules.push({
				type: 'cellIs',
				operator: 'between',
				formulae: [section.clearsForRank, section.mods.length - 1],
				style: conditionalFill(section.partialColor, section.catstare ? white : null)
			});
		}

		if (section.mods.length) {
			rules.push({
				type: 'cellIs',
				operator: 'equal',
				formulae: [section.mods.length],
				style: conditionalFill(section.color, section.catstare ? white : null)
			});
		}

		sheet.addConditionalFormatting({ ref: totalCell, rules });

		totalCells.push(totalCell);
		totalClears += clears;
		row++;
	});

	Object.assign(sheet.getCell('B3'), {
		value: { formula: `SUM(${totalCells.join(',')})`, result: totalClears },
		font: { name: 'Arial', size: 14, bold: true },
		fill: fill(white),
		alignment: center,
		border: { right: thin, top: thin, bottom: thin }
	});

	sheet.addConditionalFormatting({
		ref: 'B3',
		rules: [
			{ type: 'expression', formulae: ['ISBLANK(B$2)'], style: conditionalFill(white, white) }
		]
	});

	const buffer = await workbook.xlsx.writeBuffer();
	const url = URL.createObjectURL(
		new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		})
	);

	const link = document.createElement('a');
	link.href = url;
	link.download = `Celeste Skill Rating - ${side.name}.xlsx`;
	link.click();

	URL.revokeObjectURL(url);
}
