
//
// AST object
//

export interface AstInstruction {
	op: string;
}

// AstMeta

export interface AstMeta extends AstInstruction
{
	op: 'addMeta';
	name: string;
	value: string;
}

export function isAstMeta(obj: AstInstruction): obj is AstMeta
{
	return obj.op == 'addMeta';
}

// AstBlock

export interface AstBlock extends AstInstruction
{
	op: 'addBlock';
	name: string;
	attrs: AstBlockAttr[];
}

export function isAstBlock(obj: AstInstruction): obj is AstBlock
{
	return obj.op == 'addBlock';
}

export interface AstBlockAttr
{
	name: string;
	valueType: string;
	value: string;
}

export interface AstContainerBlock extends AstBlock
{
	children: AstBlock[];
}

export interface AstSectionBlock extends AstContainerBlock
{
	name: 'section';
}

export function isSectionBlock(obj: AstBlock): obj is AstSectionBlock
{
	return obj.name == 'section';
}

export interface AstTextBlock extends AstBlock
{
	name: 'text';
	text: string;
}

export function isTextBlock(obj: AstBlock): obj is AstTextBlock
{
	return obj.name == 'text';
}

// AstScript

export interface AstScript extends AstInstruction
{
	op: 'setAiScript';
	content: string;
}

export function isAstScript(obj: AstInstruction): obj is AstScript
{
	return obj.op == 'setAiScript';
}

//
// Meta
//

const metaDifinisions = ['aligncenter', 'title', 'name'];

export function validateMeta(meta: AstMeta)
{
	if (!metaDifinisions.some(m => m == meta.name)) {
		throw `invalid meta type: ${meta.name}`;
	}
}

//
// Block
//

interface BlockDifinision
{
	name: string;
	attrs: BlockAttrDifinision[];
}

interface BlockAttrDifinision
{
	name: string;
	required: boolean;
	valueType: string;
}

export const blockDifinisions: BlockDifinision[] = [
	{
		name: 'section',
		attrs: [
			{
				name: 'title',
				required: true,
				valueType: 'string'
			}
		]
	},
	{
		name: 'text',
		attrs: []
	}
];

export function validateBlock(block: AstBlock): void
{
	// check block name
	const blockDef = blockDifinisions.find((def) => block.name == def.name);
	if (!blockDef) {
		throw `invalid block type: ${block.name}`;
	}

	// check attribute name and type
	for (const attr of block.attrs) {
		const attrDef = blockDef.attrs.find(at => at.name == attr.name);
		if (!attrDef) {
			throw `${attr.name} attribute is invalid for section block`;
		}
		if (attrDef.valueType != attr.valueType) {
			throw `${attrDef.name} attribute: must be of ${attrDef.valueType} type`;
		}
	}

	// check required attribute
	const requiredAttrDefs = blockDef.attrs.filter(def => def.required);
	for (const attrDef of requiredAttrDefs) {
		const attr = block.attrs.find(at => at.name == attrDef.name);
		if (!attr) {
			throw `${attrDef.name} attribute is required for ${blockDef.name} block`;
		}
	}
}
