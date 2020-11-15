let enable: boolean = false;

export function enableDebug(): void
{
	enable = true;
}

export function printDebug(message: string): void
{
	if (enable) {
		console.log(message);
	}
}
