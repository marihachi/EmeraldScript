import * as Emerald from './';
import * as Hpml from '../Hpml';
import { printDebug } from '../../debug';

export interface ProcessingContext
{
	page: Hpml.Page;
	parentBlockContainer: Hpml.Block[];
	childBlockContainer: Hpml.Block[];
	contentVars: string[];
}

/**
* process an EmeraldScript instruction
*/
export function process(instruction: Emerald.Instruction, ctx: ProcessingContext): void
{
	if (Emerald.isBlock(instruction)) {
		printDebug('type: block');
		Emerald.processBlock(instruction, ctx);
	}
	else if (Emerald.isMeta(instruction)) {
		printDebug('type: meta');
		switch (instruction.name) {
		case 'aligncenter':
			printDebug('align center');
			ctx.page.alignCenter = true;
			break;
		case 'title':
			printDebug('title');
			ctx.page.title = instruction.value;
			break;
		case 'name':
			printDebug('name');
			ctx.page.name = instruction.value;
			break;
		default:
			throw `processing error: meta "${instruction.name}" is not supported`;
		}
	}
	else if (Emerald.isAiScriptArea(instruction)) {
		printDebug('instruction type: set AiScript');
		ctx.page.script = instruction.content;
	}
	else {
		throw `processing error: ${instruction.type} instruction is not supported`;
	}
}
