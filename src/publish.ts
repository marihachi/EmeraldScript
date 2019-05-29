import { promises as fs } from 'fs';
import path from 'path';

import {
	App,
	Account
} from 'corekey';

import Config from './Config';
import EmsParser from './parser/EmsParser';

async function entryPoint() {
	let config: Config | undefined;
	try {
		config = require(path.resolve('./config.json'));
	}
	catch (err) {
	}

	if (!config || !config.account) {
		console.log('login is required');
		return;
	}

	const app = new App(config.account.host, config.account.secret);
	const account = new Account(app, config.account.userToken);

	const scriptData = await fs.readFile(path.resolve(__dirname, '../example1.ems'), { encoding: 'utf8' });

	const emsParser = new EmsParser();
	const aisAst = emsParser.parse(scriptData);

	const page = await account.request('pages/create', aisAst);

	console.log(`the page is created: https://${config.account.host}/@${page.user.username}/pages/${page.name}`);
}
entryPoint()
.catch(err => {
	console.log('error:', err);
});
