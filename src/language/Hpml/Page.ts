import { v4 as uuid } from 'uuid';
import { parse as parseAiScript } from '@syuilo/aiscript';
import * as Ai from '../Aiscript';
import * as Emerald from '../Emerald';
import * as Hpml from '.';

export interface IPage
{
	title: string;
	name: string;
	alignCenter?: boolean;
	content: Hpml.IBlock[];
	variables: Hpml.IVariable[];
	script: string;
}

/**
 * generate a page from EmeraldScript instructions
*/
export function generatePage(instructions: Emerald.Instruction[]): IPage
{
	const pageId = uuid();
	const page: IPage = {
		title: pageId,
		name: pageId,
		alignCenter: false,
		content: [],
		variables: [],
		script: ''
	};

	for (const instruction of instructions) {
		if (Emerald.isMetaInfo(instruction)) {
			Emerald.validateMeta(instruction);
			switch (instruction.name) {
			case 'aligncenter':
				page.alignCenter = true;
				break;
			case 'title':
				page.title = instruction.value;
				break;
			case 'name':
				page.name = instruction.value;
				break;
			default:
				throw 'unexprected operation: unknown meta name';
			}
		}
		else if (Emerald.isBlock(instruction)) {
			const block = Hpml.generateBlock(instruction, page);
			if (block != null) {
				page.content.push(block);
			}
		}
		else if (Emerald.isAiScriptArea(instruction)) {
			page.script = instruction.content;
		}
	}

	try {
		const aiNodes: Ai.INode[] = parseAiScript(page.script);
		for (const aiNode of aiNodes) {
			if (Ai.isVariableDef(aiNode)) {
				// generate a page variable of the AiScript variable
				const aiScriptVar = Hpml.generateAiScriptVariable(aiNode.name);
				page.variables.push(aiScriptVar);
			}
		}
	}
	catch (err) {
	}

	// code generation
	let generatedCode = '\n';
	generatedCode += '@_generated_onPagesUpdated(name, value) {\n';
	for (const variable of []) { // TODO
		generatedCode += `? (name = "${variable}") { ${variable} <- value }\n`;
	}
	generatedCode += '}\n';
	generatedCode += 'MkPages:updated(_generated_onPagesUpdated)\n';
	page.script += generatedCode;

	return page;
}
