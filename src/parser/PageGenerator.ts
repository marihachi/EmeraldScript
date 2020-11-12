import { v4 as uuid } from 'uuid';
import { parse as parseAiScript } from '@syuilo/aiscript';
import * as Script from './ScriptAst';
import * as Page from './Page';
import { AiNode, isAiVarDef } from './Aiscript';

export function generatePage(instructions: Script.Instruction[]): Page.DefinitionData
{
	function generateBlock(instruction: Script.Block, parentContainer: Page.PageBlock[], ctx: Page.DefinitionData)
	{
		Script.validateBlock(instruction);

		// container block
		let children: Page.PageBlock[] = [];
		if (Script.isContainerBlock(instruction)) {
			for (const child of instruction.children) {
				generateBlock(child, children, ctx);
			}
		}

		if (Script.isTextBlock(instruction)) {
			const block = Page.generatePageTextBlock(instruction.text);
			parentContainer.push(block);
		}
		else if (Script.isSectionBlock(instruction)) {
			const titleAttr = instruction.attrs.find(attr => attr.name == 'title')!;
			const block = Page.generatePageSectionBlock(titleAttr.value, children);
			parentContainer.push(block);
		}
		else if (Script.isInputNumberBlock(instruction)) {
			const variableAttr = instruction.attrs.find(attr => attr.name == 'variable')!;
			const defaultAttr = instruction.attrs.find(attr => attr.name == 'default')!;
			const titleAttr = instruction.attrs.find(attr => attr.name == 'title');
			if (children.length > 0) {
				throw 'inputNumber block: children blocks are not supported';
			}
			const block = Page.generatePageNumberInputBlock(
				variableAttr.value,
				parseInt(defaultAttr.value, 10),
				titleAttr ? titleAttr.value : ''
			);
			parentContainer.push(block);
		}
	}

	const pageId = uuid();
	const page: Page.DefinitionData = {
		title: pageId,
		name: pageId,
		alignCenter: false,
		content: [],
		variables: [],
		script: ''
	};

	for (const instruction of instructions) {
		if (Script.isMetaInfo(instruction)) {
			Script.validateMeta(instruction);
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
		else if (Script.isBlock(instruction)) {
			generateBlock(instruction, page.content, page);
		}
		else if (Script.isScriptArea(instruction)) {
			page.script = instruction.content;
		}
	}

	try {
		const aiNodes: AiNode[] = parseAiScript(page.script);
		for (const aiNode of aiNodes) {
			if (isAiVarDef(aiNode)) {
				// generate a page variable of the AiScript variable
				const aiScriptVar = Page.generatePageVarOfAiScript(aiNode.name);
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
