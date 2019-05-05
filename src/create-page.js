const fetch = require('node-fetch');
const config = require('../config.json');

async function api(url, data) {
	const res = await fetch(url , {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	return await res.json();
}

async function entryPoint() {
	const pageSource = {
		title: 'page creation test', // ページの表示タイトル
		name: 'test1', // urlに使われる名前
		content: [],
		variables: []
	};

	const pageResult = await api('https://misskey.io/api/pages/create', {
		i: config.i,
		...pageSource
	});

	console.log({ pageId: pageResult.id });
}
entryPoint()
.catch(err => {
	console.log('error:', err);
});
