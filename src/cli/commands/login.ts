import { showHelp } from '../misc/commandUtil';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import Config from '../misc/Config';
import { inputLine } from '../misc/consoleUtil';
import semver from 'semver';

import {
	App,
	AuthSession,
	Configuration
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

	let versionRes: Record<string, any> | null = null;
	try {
		versionRes = await Configuration.Requester.request(host, 'version', { }, false);
	}
	catch {
	}
	if (versionRes == null) {
		try {
			versionRes = await Configuration.Requester.request(host, 'meta', { }, false);
		}
		catch {
		}
	}
	if (versionRes == null) {
		throw `unknown instance version`;
	}
	console.log('instance version:', versionRes.version);
	const parsed = semver.parse(versionRes.version);
	if (!parsed) {
		throw `unknown instance version`;
	}
	const versionStr: string = versionRes.version;
	
	let permissions: string[];

	const m544Instance = parsed.prerelease.length == 1 && parsed.prerelease[0] == 'm544';

	if (m544Instance) {
		if (semver.gte(versionStr, '10.102.111')) {
			permissions = ['account-read', 'note-write'];
		}
		else {
			throw `This instance does not support Misskey Pages`;
		}
	}
	else {
		if (semver.gte(versionStr, '11.5.0')) {
			permissions = ['read:pages', 'write:pages'];
		}
		else {
			throw `This instance does not support Misskey Pages`;
		}
	}

	const app = await App.create(host, 'Emerald Script', 'A text based script language for Misskey Pages', permissions);
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
