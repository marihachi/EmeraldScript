import path from 'path';
const packageInfo: any = require(path.resolve('./package.json'));

export function showVersion()
{
	console.log(packageInfo.version);
}

export function showHelp(command?: string)
{
	if (!command) {
		console.log('Usage: em <command>\n');
		console.log('where <command> is one of:');
		console.log('    build, login, publish\n');
		console.log('em <command> -h  command help');
		return;
	}

	if (command == 'build') {
		console.log('Usage: em build <inputFile> [<outputFile>]');
	}
	else if (command == 'login') {
		console.log('Usage: em login');
	}
	else if (command == 'publish') {
		console.log('Usage: em publish <aiast file>');
	}
}
