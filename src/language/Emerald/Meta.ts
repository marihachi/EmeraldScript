import * as Emerald from '.';

export interface Meta extends Emerald.Instruction
{
	op: 'addMeta';
	name: string;
	value: string;
}

export function isMetaInfo(obj: Emerald.Instruction): obj is Meta
{
	return obj.op == 'addMeta';
}

const metaDifinisions = ['aligncenter', 'title', 'name'];

export function validateMeta(meta: Meta): void
{
	if (!metaDifinisions.some(m => m == meta.name)) {
		throw `invalid meta type: ${meta.name}`;
	}
}
