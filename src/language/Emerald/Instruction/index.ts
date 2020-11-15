import * as Emerald from '..';

export interface Instruction
{
	type: string;
}

export interface Meta extends Emerald.Instruction
{
	type: 'meta';
	name: string;
	value: string;
}

export function isMeta(obj: Emerald.Instruction): obj is Meta
{
	return obj.type == 'meta';
}

export interface AiScriptArea extends Emerald.Instruction
{
	type: 'script';
	content: string;
}

export function isAiScriptArea(obj: Emerald.Instruction): obj is Emerald.AiScriptArea
{
	return obj.type == 'script';
}

export * from './Block';
