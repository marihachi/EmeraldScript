import uuid from 'uuid';
import {
	AisAst,
	AisAstObject,
	AisAstSectionBlock,
	AisAstTextBlock,
	AisAstVariable,
	AisAstFnCall,
	EmsAst,
	EmsAstBlock,
	EmsAstBlockAttr,
	EmsAstMeta,
	//EmsAstVar,
	EmsAstExpr,
	isEmsAstVarExprLiteral,
	isEmsAstExprLiteralText,
	isEmsAstExprLiteralNumber,
	isEmsAstExprBinaryOperator,
	isEmsAstExprLoopFn,
	//isEmsAstVarExprWithValue,
	EmsAstStatement,
	//isEmsAstVarExprMathOp,
	EmsAstStatementVar,
	isEmsAstStatementVar,
	isEmsAstSectionBlock,
	isEmsAstTextBlock,
	//EmsAstVarExpr,
	AisAstLiteral
} from './ast';

interface EmsInternalParser {
	SyntaxError: any;
	parse: (input: string, options?: {[x: string]: any}) => any;
}

interface AttributeDifinision {
	name: string;
	validate?: (attr: EmsAstBlockAttr) => void;
}

//
// meta
//

const requiredMetaTypes: string[] = [];
const usableMetaTypes: string[] = ['title', 'name', 'aligncenter', ...requiredMetaTypes];

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

var usableVariableTypes = [
	'text', 'loop-func', 'func', 'add', 'subtract', 'multiply', 'divide', 'number', 'ref'
];

var definedVariables: EmsAstStatementVar[] = [];

function validateExpr(expr: EmsAstExpr)
{
	// isEmsAstVarExprWithValue
	if (isEmsAstVarExprLiteral(expr)) {
		if (isEmsAstExprLiteralText(expr)) {

		}
		else if (isEmsAstExprLiteralText(expr)) {

		}
		else {
			throw new Error('unknown literal type');
		}
	}
	// isEmsAstVarExprMathOp
	else if (isEmsAstExprBinaryOperator(expr)) {
		validateExpr(expr.left);
		validateExpr(expr.right);
	}
	else if (isEmsAstExprLoopFn(expr)) {
		validateExpr(expr.expr);
		// validate: expr.slot

		// if the ref is not defined, occurs error
		if (!definedVariables.some(i => i.name == expr.slot)) {
			throw new Error(`variable '${expr.slot}' is not defined`);
		}
	}
	else {
		throw new Error('unknown expression type');
	}
}

function validateStatements(statements: EmsAstStatement[])
{
	for (const statement of statements) {
		if (isEmsAstStatementVar(statement)) {
			if (!usableVariableTypes.some(i => i == statement.expr.exprType)) {
				throw new Error(`var type '${statement.expr.exprType}' is not supported`);
			}

			// check type of assigned expression. if invalid, occurs error.
			validateExpr(statement.expr);
	
			definedVariables.push(statement);
		}
		else {
			throw new Error('unknown statement type');
		}
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
		if (isEmsAstSectionBlock(block)) {
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
		else if (isEmsAstTextBlock(block)) {
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

function transformBlocks(src: EmsAstBlock[], dest: AisAstObject[])
{
	for (const block of src) {
		if (isEmsAstTextBlock(block)) {
			const aiBlockText: AisAstTextBlock = { id: uuid.v4(), type: 'text', text: block.text };
			dest.push(aiBlockText);
		}
		else if (isEmsAstSectionBlock(block)) {
			const attr = block.attrs.find(i => i.attrType == 'title');
			const sectionTitle = attr!.content.value;
			const children: AisAstObject[] = [];
			transformBlocks(block.children, children);
			const aiBlockSection: AisAstSectionBlock = { id: uuid.v4(), type: 'section', title: sectionTitle, children: children };
			dest.push(aiBlockSection);
		}
		else {
			throw new Error('unknown block');
		}
	}
}

function transformVarExpr(src: EmsAstVarExpr, dest: (AisAstVariable | AisAstObject)[], varName?: string)
{
	if (isEmsAstVarExprMathOp(src)) {
		const left: AisAstVariable[] = [];
		transformVarExpr(src.left, left);
		const right: AisAstVariable[] = [];
		transformVarExpr(src.right, right);

		const fnCallVar: AisAstVariable | AisAstFnCall = {
			id: uuid.v4(),
			name: varName,
			type: src.exprType,
			value: null,
			args: [
				left[0],
				right[0]
			]
		};
		dest.push(fnCallVar);
	}
	else if (isEmsAstVarExprWithValue(src)) {
		const literalVar: AisAstVariable | AisAstLiteral<any> = {
			id: uuid.v4(),
			name: varName,
			type: src.exprType,
			value: src.value
		};
		dest.push(literalVar);
	}
	else {
		throw new Error('unknown expr');
	}
}

function transformToAiScript(emsAst: EmsAst): AisAst
{
	const nameMeta = emsAst.metas.find(i => i.metaType == 'name');
	const name = nameMeta ? nameMeta.value : undefined;
	const titleMeta = emsAst.metas.find(i => i.metaType == 'title');
	const title = titleMeta ? titleMeta.value : undefined;
	const alignCenter = (emsAst.metas.find(i => i.metaType == 'aligncenter') != null);

	const content: AisAstObject[] = [];
	transformBlocks(emsAst.blocks, content);

	const variables: AisAstVariable[] = [];
	for (const variable of emsAst.vars) {
		const exprs: AisAstVariable[] = [];
		transformVarExpr(variable.expr, exprs, variable.name);
		variables.push(exprs[0]);
	}

	return {
		name,
		title,
		alignCenter,
		content,
		variables
	};
}

export default class EmsParser
{
	private internalParser: EmsInternalParser;

	constructor()
	{
		this.internalParser = require('./peg/EmsInternalParser.js');
	}

	parse(inputCode: string): AisAst
	{
		// generate EmeraldScript AST
		const ast: EmsAst = this.internalParser.parse(inputCode, { });

		//const astJson = JSON.stringify(ast, undefined, '  ');
		//console.log('ast:', astJson);

		// validate semantics
		validateMetas(ast.metas);
		validateStatements(ast.statements);
		validateBlocks(ast.blocks);

		// transform to ai script
		const aiAst = transformToAiScript(ast);

		return aiAst;
	}
}
