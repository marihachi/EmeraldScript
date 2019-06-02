import { showHelp } from '../misc/commandUtil';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import Config from '../misc/Config';
import inputLine from '../misc/inputLine';

import {
	App,
	AuthSession
} from 'corekey';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export default async function(args: string[])
{
	const helpOptions = ['-h', '--help'];
	if (/*args.length == 0 || */helpOptions.some((i) => i == args[0])) {
		showHelp('login');
		return;
	}

	let host = await inputLine('Input the host name of misskey instance (default: misskey.io) > ');
	if (host == '') host = 'misskey.io';

	const app = await App.create(host, 'Emerald Script', 'A text based script language for Misskey Pages', ['read:pages', 'write:pages']);
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

	try {
		await mkdir('./.em');
	}
	catch (err) {
	}

	await writeFile(path.resolve('./.em/setting.json'), JSON.stringify(config));

	console.log('Login succeeded!');
}
