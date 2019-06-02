import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import EmsParser from '../../parser/EmsParser';
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

		outputFile = path.join(inputDir, `${fileNameWithoutExt}.ai.json`);
	}
	if (!path.isAbsolute(outputFile)) {
		outputFile = path.resolve(outputFile);
	}

	const scriptData = await readFile(inputFile, { encoding: 'utf8' });
	const emsParser = new EmsParser();
	const aisAst = emsParser.parse(scriptData);
	await writeFile(outputFile, JSON.stringify(aisAst));
}
