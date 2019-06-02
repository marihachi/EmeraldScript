#! /usr/bin/env node

import { showHelp, showVersion } from './commandUtil';
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

	if (args[0] == 'build') {
		build(args.slice(1));
	}
	else if (args[0] == 'login') {
		login(args.slice(1));
	}
	else if (args[0] == 'publish') {
		publish(args.slice(1));
	}
	else {
		showHelp();
	}
}
entryPoint()
.catch(err => {
	console.log('error:', err);
});