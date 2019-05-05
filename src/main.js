const parser = require('../built/lang/main.js');
const fs = require('fs').promises;
const path = require('path');

async function entryPoint() {
	console.log('================');
	console.log(' emerald script ');
	console.log('================');

	const scriptData = await fs.readFile(path.resolve(__dirname, '../example1.ems'), { encoding: 'utf8' });

	const result = parser.parse(scriptData, { });
	console.log('result: ', result);
}
entryPoint()
.catch(err => {
	console.log('error: ', err);
});
