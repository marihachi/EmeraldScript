#! /usr/bin/env node

import { showHelp, showVersion } from './misc/commandUtil';
import newFile from './commands/new';
import build from './commands/build';
import publish from './commands/publish';
import login from './commands/login';

async function entryPoint() {
	const args = process.argv.slice(2);

	const helpOptions = ['-h', '--help'];
	if (args.length == 0 || helpOptions.some((i) => i == args[0])) {
		showHelp();
		return;
	}

	const versionOptions = ['-v', '--version'];
	if (versionOptions.some((i) => i == args[0])) {
		showVersion();
		return;
	}

	switch (args[0]) {
	case 'new':
		await newFile(args.slice(1));
		break;
	case 'build':
		await build(args.slice(1));
		break;
	case 'login':
		await login(args.slice(1));
		break;
	case 'publish':
		await publish(args.slice(1));
		break;
	default:
		showHelp();
		break;
	}
}
entryPoint()
.catch(err => {
	console.log('[error]', err);
});
