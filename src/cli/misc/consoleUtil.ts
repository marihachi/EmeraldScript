import readLine from 'readline';

export function inputLine(message: string): Promise<string> {
	return new Promise<string>((resolve) => {
		const rl = readLine.createInterface(process.stdin, process.stdout);
		rl.question(message, (ans) => {
			resolve(ans);
			rl.close();
		});
	});
}
