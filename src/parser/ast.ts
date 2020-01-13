/*
 * EmeraldScript AST
*/

export interface EmsAst {
	metas: EmsAstMeta[];
	statements: EmsAstStatement[];
	blocks: EmsAstBlock[];
}

// meta
export interface EmsAstMeta {
	metaType: string;
	value: string;
}

// statement
export interface EmsAstStatement {
	statementType: string;
}

// statement: variable
export interface EmsAstStatementVar extends EmsAstStatement {
	statementType: 'variable';
	name: string;
	expr: EmsAstExpr;
}
export function isEmsAstStatementVar(x: EmsAstStatement): x is EmsAstStatementVar {
	return (x.statementType == 'variable');
}

// expression
export interface EmsAstExpr {
	exprType: string;
}

// expression: literal
interface EmsAstExprLiteral extends EmsAstExpr {
	exprType: 'literal';
	literalType: string;
	value: string;
}
export function isEmsAstVarExprLiteral(x: EmsAstExpr): x is EmsAstExprLiteral {
	return (x.exprType == 'literal');
}

// EmsAstExprMathOp
// expression: binary operator(add, subtract, multiply, divide)
interface EmsAstExprBinaryOperator extends EmsAstExpr {
	left: EmsAstExpr;
	right: EmsAstExpr;
}
export function isEmsAstExprBinaryOperator(x: EmsAstExpr & Record<string, any>): x is EmsAstExprBinaryOperator {
	return (x.left != null && x.right != null);
}

// expression: loop-func
interface EmsAstExprLoopFn extends EmsAstExpr {
	slot: string;
	times: string;
	expr: EmsAstExpr;
}
export function isEmsAstExprLoopFn(x: EmsAstExpr & Record<string, any>): x is EmsAstExprLoopFn {
	return (x.slot != null && x.times != null && x.expr != null);
}

/*
// expression: function call
export interface EmsAstFnCallExpr {
	exprType: 'fn-call';
}
*/

// literal: text
interface EmsAstExprLiteralText extends EmsAstExprLiteral {
	literalType: 'text';
}
export function isEmsAstExprLiteralText(x: EmsAstExprLiteral): x is EmsAstExprLiteralText {
	return (x.literalType == 'text');
}

// literal: number
interface EmsAstExprLiteralNumber extends EmsAstExprLiteral {
	literalType: 'number';
}
export function isEmsAstExprLiteralNumber(x: EmsAstExprLiteral): x is EmsAstExprLiteralNumber {
	return (x.literalType == 'number');
}

// block
export interface EmsAstBlock {
	blockType: string;
	attrs: EmsAstBlockAttr[];
}

// block attribute
export interface EmsAstBlockAttr {
	attrType: string;
	content: {
		attrContentType: string;
		value: string;
	};
}

// block: section
interface EmsAstSectionBlock extends EmsAstBlock {
	blockType: 'section';
	children: EmsAstBlock[];
}
export function isEmsAstSectionBlock(x: EmsAstBlock): x is EmsAstSectionBlock {
	return (x.blockType == 'section');
}

// block: text
interface EmsAstTextBlock extends EmsAstBlock {
	blockType: 'text';
	text: string;
}
export function isEmsAstTextBlock(x: EmsAstBlock): x is EmsAstTextBlock {
	return (x.blockType == 'text');
}

/*
 * AiScript AST
*/

export interface AisAst {
	title?: string;
	name?: string;
	alignCenter?: boolean;
	content: AisAstObject[];
	variables: AisAstVariable[];
}

export interface AisAstObject {
	id: string;
	type: string;
}
export function isAisAstObject(x: Record<string, any>): x is AisAstObject & Record<string, any> {
	return (typeof x.id == 'string' && typeof x.type == 'string');
}

//
// Content AST
//

export interface AisAstSectionBlock extends AisAstObject {
	type: 'section';
	title: string;
	children: AisAstObject[];
}
export function isAisAstSectionBlock(x: AisAstObject & Record<string, any>): x is AisAstSectionBlock {
	return (x.type == 'section');
}

export interface AisAstTextBlock extends AisAstObject {
	type: 'text';
	text: string;
}
export function isAisAstTextBlock(x: AisAstObject & Record<string, any>): x is AisAstTextBlock {
	return (x.type == 'text');
}

//
// Variable AST
//

export interface AisAstLiteral<T> extends AisAstObject {
	value: T;
}
export function isAisAstLiteral(x: AisAstObject & Record<string, any>): x is AisAstLiteral<any> {
	return (x.value != null);
}

export interface AisAstVariable extends AisAstLiteral<any> {
	name: string;
}
export function isAisAstVariable(x: AisAstObject & Record<string, any>): x is AisAstVariable & Record<string, any> {
	return (x.name != null);
}

export interface AisAstSlot {
	name: string;
	type: null;
}
export function isAisAstSlot(x: Record<string, any>): x is AisAstSlot {
	return (typeof x.name == 'string' && x.type == null);
}

type Expr = (AisAstLiteral<any> | AisAstFnCall);

// function call
export interface AisAstFnCall extends AisAstLiteral<null> {
	args: Expr[];
}
export function isAisAstFnCall(x: AisAstLiteral<any> & Record<string, any>): x is AisAstFnCall & Record<string, any> {
	return (x.value == null && Array.isArray(x.args));
}

// user defined function object
export interface UserFn {
	slots: AisAstSlot[];
	expression: Expr;
}

// literal: text
export interface AisAstTextLiteral extends AisAstLiteral<string> {
	type: 'text';
}
export function isAisAstTextLiteral(x: AisAstLiteral<any>): x is AisAstTextLiteral {
	return (x.type == 'text');
}

// literal: number
export interface AisAstNumberLiteral extends AisAstLiteral<string> {
	type: 'number';
}
export function isAisAstNumberLiteral(x: AisAstLiteral<any>): x is AisAstNumberLiteral {
	return (x.type == 'number');
}

// literal: ref
export interface AisAstRefLiteral extends AisAstLiteral<string> {
	type: 'ref';
}
export function isAisAstRefLiteral(x: AisAstLiteral<any>): x is AisAstRefLiteral {
	return (x.type == 'ref');
}

// literal: multiLineText
export interface AisAstMultiLineTextLiteral extends AisAstLiteral<string> {
	type: 'multiLineText';
}
export function isAisAstMultiLineTextLiteral(x: AisAstLiteral<any>): x is AisAstMultiLineTextLiteral {
	return (x.type == 'multiLineText');
}

// literal: textList
export interface AisAstTextListLiteral extends AisAstLiteral<string> {
	type: 'textList';
}
export function isAisAstTextListLiteral(x: AisAstLiteral<any>): x is AisAstTextListLiteral {
	return (x.type == 'textList');
}

// literal: fn (user definined function)
export interface AisAstUserFnLiteral extends AisAstLiteral<UserFn> {
	type: 'fn';
}
export function isAisAstUserFnLiteral(x: AisAstLiteral<any>): x is AisAstUserFnLiteral {
	return (x.type == 'fn');
}
