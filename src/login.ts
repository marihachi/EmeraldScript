import { promises as fs } from 'fs';
import path from 'path';

import {
	App,
	AuthSession
} from 'corekey';

import Config from './Config';

async function entryPoint() {
	const app = await App.create('misskey.io', 'Emerald Script', '', ['write:notes', 'read:pages', 'write:pages']);
	const session = await AuthSession.generate(app);
	console.log('start login:', session.url);
	const account = await session.waitForAuth();

	const config: Config = {
		account: {
			host: app.host,
			secret: app.secret,
			userToken: account.userToken
		}
	};

	await fs.writeFile(path.resolve('./config.json'), JSON.stringify(config));

	console.log('Login succeeded!');
}
entryPoint()
.catch(err => {
	console.log('error:', err);
});
