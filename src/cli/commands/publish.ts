import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { showHelp } from '../misc/commandUtil';
import Config from '../misc/Config';

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
		inputFile = path.resolve(inputFile);
	}

	let config: Config | undefined;
	try {
		config = require(path.resolve('./.em/setting.json'));
	}
	catch (err) {
	}

	if (!config || !config.account) {
		throw 'login is required';
	}

	const app = new App(config.account.host, config.account.secret);
	const account = new Account(app, config.account.userToken);

	let aiastJson;
	try {
		aiastJson = await readFile(inputFile, { encoding: 'utf8' });
	}
	catch (err) {
		throw 'failed to open the input file';
	}
	
	let aiast: any;
	try {
		aiast = JSON.parse(aiastJson);
	}
	catch (err) {
	}

	if (!aiast || !aiast.content || !aiast.variables) {
		throw 'the input file is invalid format';
	}

	const page = await account.request('pages/create', aiast);

	if (page.error) {
		if (page.error.kind == 'server' && page.error.info) {
			console.log(JSON.stringify(page.error.info));
		}

		throw `failed to create the page (error: ${page.error.message})`;
	}

	console.log('The page has been created');
	console.log(`page id: ${page.id}`);
	console.log(`page url: https://${config.account.host}/@${page.user.username}/pages/${page.name}`);
}
