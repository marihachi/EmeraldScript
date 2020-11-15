import * as Emerald from './';
import * as Hpml from '../Hpml';
import { printDebug } from '../../debug';

export interface EvaluationContext
{
	page: Hpml.Page;
	parentBlockContainer: Hpml.Block[];
	childBlockContainer: Hpml.Block[];
	contentVars: string[];
}

function evaluateBlock(instruction: Emerald.Block, ctx: EvaluationContext): void
{
	// check block name
	const blockDef = Emerald.blockDifinisions.find((def) => instruction.name == def.name);
	if (!blockDef) {
		throw `evaluation error: ${instruction.name} block is not supported`;
	}

	// check name and type of attributes
	for (const attr of instruction.attrs) {
		const attrDef = blockDef.attrs.find(at => at.name == attr.name);
		if (!attrDef) {
			throw `evaluation error: ${attr.name} attribute is invalid for ${instruction.name} block`;
		}

		if (attrDef.validator.nok(attr.value)) {
			throw `evaluation error: invalid value "${attr.value}" is invalid value for ${attr.name} attribute of ${instruction.name} block`;
		}
	}

	// check required attributes
	const requiredAttrDefs = blockDef.attrs.filter(def => def.required);
	for (const attrDef of requiredAttrDefs) {
		const attr = instruction.attrs.find(at => at.name == attrDef.name);
		if (!attr) {
			throw `${attrDef.name} attribute is required for ${blockDef.name} block`;
		}
	}

	// evaluate inner instructions
	if (Emerald.isContainerBlock(instruction)) {
		printDebug('the block is container');
		const parentContainer = ctx.parentBlockContainer;
		ctx.parentBlockContainer = [];
		printDebug('begin children evaluation');
		for (const child of instruction.children) {
			evaluate(child, ctx);
		}
		printDebug('end children evaluation');
		ctx.childBlockContainer = ctx.parentBlockContainer;
		ctx.parentBlockContainer = parentContainer;
	}

	printDebug(`block type: ${instruction.name}`);
	// evaluate the setBlock instruction
	blockDef.evaluate(instruction, ctx);
}

/**
* evaluate an EmeraldScript instruction
*/
export function evaluate(instruction: Emerald.Instruction, ctx: EvaluationContext): void
{
	if (Emerald.isBlock(instruction)) {
		printDebug('instruction type: add block');
		evaluateBlock(instruction, ctx);
	}
	else if (Emerald.isMeta(instruction)) {
		printDebug('instruction type: add meta');
		switch (instruction.name) {
		case 'aligncenter':
			printDebug('meta type: align center');
			ctx.page.alignCenter = true;
			break;
		case 'title':
			printDebug('meta type: title');
			ctx.page.title = instruction.value;
			break;
		case 'name':
			printDebug('meta type: name');
			ctx.page.name = instruction.value;
			break;
		default:
			throw `evaluation error: ${instruction.name} meta is not supported`;
		}
	}
	else if (Emerald.isAiScriptArea(instruction)) {
		printDebug('instruction type: set AiScript');
		ctx.page.script = instruction.content;
	}
	else {
		throw `evaluation error: ${instruction.op} instruction is not supported`;
	}
}
