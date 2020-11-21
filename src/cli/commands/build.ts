import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import * as Emerald from '../../language/Emerald';
import { showHelp } from '../misc/commandUtil';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export default async function(args: string[])
{
	const helpOptions = ['-h', '--help'];
	if (args.length == 0 || helpOptions.some((i) => i == args[0])) {
		showHelp('build');
		return;
	}

	let inputFile = args[0];
	if (!path.isAbsolute(inputFile)) {
		inputFile = path.resolve(inputFile);
	}

	let outputFile;
	if (args.length >= 2) {
		outputFile = args[1];
	}
	else {
		const inputDir = path.dirname(inputFile);

		let fileNameSplited = path.basename(inputFile).split('.');
		if (fileNameSplited.length > 1) {
			fileNameSplited.splice(fileNameSplited.length - 1, 1);
		}
		const fileNameWithoutExt = fileNameSplited.join('.');

		outputFile = path.join(inputDir, `${fileNameWithoutExt}.page.json`);
	}
	if (!path.isAbsolute(outputFile)) {
		outputFile = path.resolve(outputFile);
	}

	let emeraldScriptCode;
	try {
		emeraldScriptCode = await readFile(inputFile, { encoding: 'utf8' });
	}
	catch (err) {
		throw 'failed to open the input file';
	}

	let hpmlCode: string;
	try {
		hpmlCode = Emerald.compile(emeraldScriptCode);
	}
	catch (err) {
		console.log('[SyntaxError]', err);
		return;
	}

	try {
		await writeFile(outputFile, hpmlCode);
	}
	catch (err) {
		throw 'failed to generate the page file';
	}

	console.log('An page file has been generated:');
	console.log(outputFile); 
}
