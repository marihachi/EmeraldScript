import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
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

	let outputFile = `${args[0]}.ems`;
	if (!path.isAbsolute(outputFile)) {
		outputFile = path.resolve(outputFile);
	}

	try {
		await writeFile(outputFile, await readFile(path.join(__dirname, '../../../examples/helloworld.ems')));
	}
	catch (err) {
		console.log(err);
		throw 'failed to generate the script file';
	}

	console.log('A new script file has been generated:');
	console.log(outputFile); 
}
