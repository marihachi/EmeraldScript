import { v4 as uuid } from 'uuid';

interface EmsInternalParser {
	SyntaxError: any;
	parse: (input: string, options?: {[x: string]: any}) => any;
}

// EmeraldScript AST

interface EmsAst {
	metas: EmsAstMeta[];
	vars: EmsAstVar[];
	blocks: EmsAstBlock[];
	script: string;
}

interface EmsAstMeta {
	metaType: string;
	value: string;
}

interface EmsAstVar {
	name: string;
	varType: string;
	value: EmsAstVarExpr;
}

interface EmsAstVarExpr {
	exprType: string;
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
	alignCenter?: boolean;
	content: AisAstBlock[];
	variables: any[];
	script: string;
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

interface AisAstVar {
	id: string;
	type: string;
	name: string;
	value: string;
}

//
// meta
//

const requiredMetaTypes = ['title', 'name'];
const usableMetaTypes = ['aligncenter', ...requiredMetaTypes];

function validateMetas(metas: EmsAstMeta[])
{
	for (const meta of metas) {
		if (!usableMetaTypes.some(i => i == meta.metaType)) {
			throw new Error(`invalid meta type: ${meta.metaType}`);
		}
	}
	for (const requiredMetaType of requiredMetaTypes) {
		if (!metas.some(i => i.metaType == requiredMetaType)) {
			throw new Error(`metadata ${requiredMetaType} is required`);
		}
	}
}

//
// variable
//

var usableVariableTypes = ['text', 'number', 'ref'];

var definedVariables: EmsAstVar[] = [];

function validateVariables(vars: EmsAstVar[])
{
	for (const variable of vars) {
		if (!usableVariableTypes.some(i => i == variable.varType)) {
			throw new Error(`var type '${variable.varType}' is not supported`);
		}

		// check type of assigned expression. if invalid, occurs error.

		if (variable.varType == 'text') {
			// occurs error if right side and left side is not compatible type
			if (variable.value.exprType != 'text') {
				throw new Error(`right side and left side is not compatible type (varType=text, exprType=${variable.value.exprType})`);
			}
		}
		if (variable.varType == 'number') {
			// occurs error if right side and left side is not compatible type
			if (variable.value.exprType != 'number') {
				throw new Error(`right side and left side is not compatible type (varType=number, exprType=${variable.value.exprType})`);
			}
		}
		if (variable.varType == 'ref') {
			// occurs error if right side and left side is not compatible type
			if (variable.value.exprType != 'identifier') {
				throw new Error(`right side and left side is not compatible type (varType=ref, exprType=${variable.value.exprType})`);
			}

			// occurs error if undefined
			if (!definedVariables.some(i => i.name == variable.value.value)) {
				throw new Error(`variable '${variable.value.value}' is not defined`);
			}
		}

		definedVariables.push(variable);
	}
}


//
// block
//

const sectionTitleAttr: AttributeDifinision = {
	name: 'title',
	validate(attr: EmsAstBlockAttr)
	{
		if (attr.content.attrContentType != 'text') {
			throw new Error(`title attribute must be of type text`);
		}
	}
};

const sectionBlockRequiredAttrs: AttributeDifinision[] = [sectionTitleAttr];
const sectionBlockUsableAttrs: AttributeDifinision[] = [...sectionBlockRequiredAttrs];
const textBlockRequiredAttrs: AttributeDifinision[] = [];
const textBlockUsableAttrs: AttributeDifinision[] = [...textBlockRequiredAttrs];

function validateBlocks(blocks: EmsAstBlock[])
{
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


export default class EmsParser
{
	internalParser: EmsInternalParser;

	constructor()
	{
		this.internalParser = require('./peg/EmsInternalParser.js');
	}

	parse(inputCode: string): AisAst
	{
		// generate EmeraldScript AST
		const ast: EmsAst = this.internalParser.parse(inputCode, { });

		// validate semantics
		validateMetas(ast.metas);
		validateVariables(ast.vars);
		validateBlocks(ast.blocks);

		// transform to ai script
		const aiAst = this.transformToAiScript(ast);

		return aiAst;
	}

	transformToAiScript(emsAst: EmsAst): AisAst
	{
		const name = emsAst.metas.find(i => i.metaType == 'name');
		const title = emsAst.metas.find(i => i.metaType == 'title');
		let alignCenter = emsAst.metas.find(i => i.metaType == 'aligncenter');

		function transformBlocks(src: EmsAstBlock[], dest: AisAstBlock[])
		{
			for (const block of src) {
				if (isTextBlock(block)) {
					const aiBlockText: AisAstTextBlock = { id: uuid(), type: 'text', text: block.text };
					dest.push(aiBlockText);
				}
				if (isSectionBlock(block)) {
					const attr = block.attrs.find(i => i.attrType == 'title');
					const sectionTitle = attr!.content.value;
					const children: AisAstBlock[] = [];
					transformBlocks(block.children, children);
					const aiBlockSection: AisAstSectionBlock = { id: uuid(), type: 'section', title: sectionTitle, children: children };
					dest.push(aiBlockSection);
				}
			}
		}
		const blocks: AisAstBlock[] = [];
		transformBlocks(emsAst.blocks, blocks);

		function transformVars(src: EmsAstVar[], dest: AisAstVar[])
		{
			for (const variable of src) {
				vars.push({
					id: uuid(),
					type: variable.varType,
					value: variable.value.value,
					name: variable.name
				});
			}
		}
		const vars: AisAstVar[] = [];
		transformVars(emsAst.vars, vars);

		return {
			name: name!.value,
			title: title!.value,
			alignCenter: (alignCenter != null),
			content: blocks,
			variables: vars,
			script: emsAst.script
		};
	}
}
