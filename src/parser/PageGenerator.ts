import { v4 as uuid } from 'uuid';
import { parse as parseAiScript } from '@syuilo/aiscript';
import { AstBlock, isTextBlock, isSectionBlock, AstInstruction, isAstBlock, isAstMeta, validateMeta, validateBlock, isAstScript, isInputNumberBlock } from './ScriptAst';
import { PageObject, PageBlock, generatePageSectionBlock, generatePageTextBlock, generatePageVarOfAiScript, generatePageNumberInputBlock } from './Page';
import { AiNode, isAiVarDef } from './Aiscript';

export function generatePage(instructions: AstInstruction[]): PageObject
{
	function generateBlock(instruction: AstBlock, parentContainer: PageBlock[], ctx: PageObject)
	{
		validateBlock(instruction);
		if (isTextBlock(instruction)) {
			const block = generatePageTextBlock(instruction.text);
			parentContainer.push(block);
		}
		else if (isSectionBlock(instruction)) {
			const titleAttr = instruction.attrs.find(attr => attr.name == 'title')!;
			const children: PageBlock[] = [];
			for (const child of instruction.children) {
				generateBlock(child, children, ctx);
			}
			const block = generatePageSectionBlock(titleAttr.value, children);
			parentContainer.push(block);
		}
		else if (isInputNumberBlock(instruction)) {
			const variableAttr = instruction.attrs.find(attr => attr.name == 'variable')!;
			const defaultAttr = instruction.attrs.find(attr => attr.name == 'default')!;
			const titleAttr = instruction.attrs.find(attr => attr.name == 'title');
			const block = generatePageNumberInputBlock(
				variableAttr.value,
				parseInt(defaultAttr.value, 10),
				titleAttr ? titleAttr.value : ''
			);
			parentContainer.push(block);
		}
	}

	const pageId = uuid();
	const page: PageObject = {
		title: pageId,
		name: pageId,
		alignCenter: false,
		content: [],
		variables: [],
		script: ''
	};

	for (const instruction of instructions) {
		if (isAstMeta(instruction)) {
			validateMeta(instruction);
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
		else if (isAstBlock(instruction)) {
			generateBlock(instruction, page.content, page);
		}
		else if (isAstScript(instruction)) {
			page.script = instruction.content;
		}
	}

	if (page.script) {
		try {
			const aiNodes: AiNode[] = parseAiScript(page.script);
			for (const aiNode of aiNodes) {
				if (isAiVarDef(aiNode)) {
					// generate a page variable of the AiScript variable
					const aiScriptVar = generatePageVarOfAiScript(aiNode.name);
					page.variables.push(aiScriptVar);
				}
			}
		}
		catch (err) {
		}
	}

	return page;
}
