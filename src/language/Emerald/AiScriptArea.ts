import * as Emerald from '.';

export interface AiScriptArea extends Emerald.Instruction
{
	op: 'setAiScript';
	content: string;
}

export function isAiScriptArea(obj: Emerald.Instruction): obj is AiScriptArea
{
	return obj.op == 'setAiScript';
}
