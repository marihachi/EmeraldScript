import { showHelp } from '../commandUtil';

export default async function(args: string[])
{
	const helpOptions = ['-h', '--help'];
	if (args.length == 0 || helpOptions.some((i) => i == args[0])) {
		showHelp('publish');
		return;
	}

	console.log('not implemented');
}
