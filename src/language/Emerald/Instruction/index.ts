import * as Emerald from '..';

export interface Instruction
{
	op: string;
}

export interface Meta extends Emerald.Instruction
{
	op: 'addMeta';
	name: string;
	value: string;
}

export function isMeta(obj: Emerald.Instruction): obj is Meta
{
	return obj.op == 'addMeta';
}

export interface AiScriptArea extends Emerald.Instruction
{
	op: 'setAiScript';
	content: string;
}

export function isAiScriptArea(obj: Emerald.Instruction): obj is Emerald.AiScriptArea
{
	return obj.op == 'setAiScript';
}

export * from './Block';
