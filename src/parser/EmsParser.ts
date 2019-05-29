import uuid from 'uuid';

interface EmsInternalParser {
	SyntaxError: any;
	parse: (input: string, options?: {[x: string]: any}) => any;
}

// EmeraldScript AST

interface EmsAst {
	metas: EmsAstMeta[];
	vars: EmsAstVar[];
	blocks: EmsAstBlock[];
}

interface EmsAstMeta {
	metaType: string;
	value: string;
}

interface EmsAstVar {
	name: string;
	varType: string;
	value: string;
}

interface EmsAstBlock {
	blockType: string;
	attrs: EmsAstBlockAttr[];
}

interface EmsAstBlockAttr {
	attrType: string;
	content: {
		attrContentType: string;
		value: string;
	};
}

interface EmsAstSectionBlock extends EmsAstBlock {
	children: EmsAstBlock[];
}
function isSectionBlock(obj: EmsAstBlock): obj is EmsAstSectionBlock {
	return obj.blockType == 'section';
}

interface EmsAstTextBlock extends EmsAstBlock {
	text: string;
}
function isTextBlock(obj: EmsAstBlock): obj is EmsAstTextBlock {
	return obj.blockType == 'text';
}


interface AttributeDifinision {
	name: string;
	validate?: (attr: EmsAstBlockAttr) => void;
}

// AiScript AST

interface AisAst {
	title: string;
	name: string;
	content: AisAstBlock[];
	variables: any[];
}

interface AisAstBlock {
	id: string;
	type: string;
}

interface AisAstSectionBlock extends AisAstBlock {
	type: 'section';
	title: string;
	children: AisAstBlock[];
}

interface AisAstTextBlock extends AisAstBlock {
	type: 'text';
	text: string;
}


export default class EmsParser {
	internalParser: EmsInternalParser;

	constructor() {
		this.internalParser = require('./peg/EmsInternalParser.js');
	}

	parse(inputCode: string): AisAst {

		// # generate EmeraldScript AST

		const ast: EmsAst = this.internalParser.parse(inputCode, { });

		// # parse semantics

		// meta

		const requiredMetaTypes = ['title', 'name'];
		const usableMetaTypes = [...requiredMetaTypes];
		for (const meta of ast.metas) {
			if (usableMetaTypes.indexOf(meta.metaType) == -1) {
				throw new Error(`invalid meta type: ${meta.metaType}`);
			}
		}
		for (const requiredMetaType of requiredMetaTypes) {
			if (ast.metas.findIndex(i => i.metaType == requiredMetaType) == -1) {
				throw new Error(`metadata ${requiredMetaType} is required`);
			}
		}

		// var

		if (ast.vars.length != 0) {
			// not supported yet
			throw new Error('feature-not-supported: define variables');
		}

		// block

		const sectionTitleAttr: AttributeDifinision = {
			name: 'title',
			validate(attr: EmsAstBlockAttr) {
				if (attr.content.attrContentType != 'text') {
					throw new Error(`title attribute must be of type text`);
				}
			}
		};

		const sectionBlockRequiredAttrs: AttributeDifinision[] = [sectionTitleAttr];
		const sectionBlockUsableAttrs: AttributeDifinision[] = [...sectionBlockRequiredAttrs];
		const textBlockRequiredAttrs: AttributeDifinision[] = [];
		const textBlockUsableAttrs: AttributeDifinision[] = [...textBlockRequiredAttrs];

		function validateBlocks(blocks: EmsAstBlock[]) {
			for (const block of blocks) {
				if (isSectionBlock(block)) {
					for (const attr of block.attrs) {
						if (sectionBlockUsableAttrs.findIndex(i => i.name == attr.attrType) == -1) {
							throw new Error(`${attr} attribute is invalid for section block`);
						}
					}
					for (const requiredAttr of sectionBlockRequiredAttrs) {
						const attr = block.attrs.find(i => i.attrType == requiredAttr.name);
						if (!attr) {
							throw new Error(`${attr} attribute is required for section block`);
						}
						if (requiredAttr.validate) {
							requiredAttr.validate(attr);
						}
					}
					validateBlocks(block.children);
				}
				else if (isTextBlock(block)) {
					for (const attr of block.attrs) {
						if (textBlockUsableAttrs.findIndex(i => i.name == attr.attrType) == -1) {
							throw new Error(`${attr} attribute is invalid for text block`);
						}
					}
					for (const requiredAttr of textBlockRequiredAttrs) {
						const attr = block.attrs.find(i => i.attrType == requiredAttr.name);
						if (!attr) {
							throw new Error(`${requiredAttr} attribute is required for text block`);
						}
						if (requiredAttr.validate) {
							requiredAttr.validate(attr);
						}
					}
				}
			}
		}

		validateBlocks(ast.blocks);

		return this.transformToAiScript(ast);
	}

	transformToAiScript(emsAst: EmsAst): AisAst {
		const name = emsAst.metas.find(i => i.metaType == 'name');
		const title = emsAst.metas.find(i => i.metaType == 'title');

		function transformBlocks(src: EmsAstBlock[], dest: AisAstBlock[]) {
			for (const block of src) {
				if (isTextBlock(block)) {
					const aiBlockText: AisAstTextBlock = { id: uuid.v4(), type: 'text', text: block.text };
					dest.push(aiBlockText);
				}
				if (isSectionBlock(block)) {
					const attr = block.attrs.find(i => i.attrType == 'title');
					const sectionTitle = attr!.content.value;
					const children: AisAstBlock[] = [];
					transformBlocks(block.children, children);
					const aiBlockSection: AisAstSectionBlock = { id: uuid.v4(), type: 'section', title: sectionTitle, children: children };
					dest.push(aiBlockSection);
				}
			}
		}
		const blocks: AisAstBlock[] = [];
		transformBlocks(emsAst.blocks, blocks);

		return {
			name: name!.value,
			title: title!.value,
			content: blocks,
			variables: [] // not supported yet
		};
	}
}
