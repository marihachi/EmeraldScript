import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { showHelp } from '../commandUtil';
import Config from '../Config';

import {
	App,
	Account
} from 'corekey';

const readFile = promisify(fs.readFile);

export default async function(args: string[])
{
	const helpOptions = ['-h', '--help'];
	if (args.length == 0 || helpOptions.some((i) => i == args[0])) {
		showHelp('publish');
		return;
	}

	let inputFile = args[0];
	if (!path.isAbsolute(inputFile)) {
		inputFile = path.resolve(process.cwd(), inputFile);
	}

	let config: Config | undefined;
	try {
		config = require(path.resolve(process.cwd(), './config.json'));
	}
	catch (err) {
	}

	if (!config || !config.account) {
		console.log('login is required');
		return;
	}

	const app = new App(config.account.host, config.account.secret);
	const account = new Account(app, config.account.userToken);

	const aiastJson = await readFile(inputFile, { encoding: 'utf8' });
	
	let aiast: any;
	try {
		aiast = JSON.parse(aiastJson);
	}
	catch (err) {
	}

	if (!aiast || !aiast.content || !aiast.variables) {
		console.log('the input file is invalid format');
		return;
	}

	const page = await account.request('pages/create', aiast);

	console.log('The page has been created.');
	console.log(`page id: ${page.id}`);
	console.log(`page url: https://${config.account.host}/@${page.user.username}/pages/${page.name}`);
}
