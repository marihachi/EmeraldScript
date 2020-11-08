import { v4 as uuid } from 'uuid';
import { AstBlock, isTextBlock, isSectionBlock, AstInstruction, isAstBlock, isAstMeta, validateMeta, validateBlock } from './ScriptAst';
import { PageObject, PageBlock, generatePageSectionBlock, generatePageTextBlock } from './Page';

export function generatePage(instructions: AstInstruction[]): PageObject
{
	function generateBlock(instruction: AstBlock, parentContainer: PageBlock[], ctx: PageObject)
	{
		validateBlock(instruction);
		if (isTextBlock(instruction)) {
			const pageTextBlock = generatePageTextBlock(instruction.text);
			parentContainer.push(pageTextBlock);
		}
		else if (isSectionBlock(instruction)) {
			const titleAttr = instruction.attrs.find(attr => attr.name == 'title')!;
			const children: PageBlock[] = [];
			for (const child of instruction.children) {
				generateBlock(child, children, ctx);
			}
			const sectionBlock = generatePageSectionBlock(titleAttr.value, children);
			parentContainer.push(sectionBlock);
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
	}

	return page;
}
