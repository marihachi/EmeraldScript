import $, { StringContext } from 'cafy';

//
// AST object
//

export interface Instruction
{
	op: string;
}

// MetaInfo

export interface MetaInfo extends Instruction
{
	op: 'addMeta';
	name: string;
	value: string;
}

export function isMetaInfo(obj: Instruction): obj is MetaInfo
{
	return obj.op == 'addMeta';
}

// Block

export interface Block extends Instruction
{
	op: 'addBlock';
	name: string;
	attrs: BlockAttr[];
}

export function isBlock(obj: Instruction): obj is Block
{
	return obj.op == 'addBlock';
}

export interface BlockAttr
{
	name: string;
	valueType: string;
	value: string;
}

export interface ContainerBlock extends Block
{
	children: Block[];
}

export function isContainerBlock(obj: Block): obj is ContainerBlock
{
	return (obj as any).children != null;
}

export interface SectionBlock extends ContainerBlock
{
	name: 'section';
}

export function isSectionBlock(obj: Block): obj is SectionBlock
{
	return obj.name == 'section';
}

export interface TextBlock extends Block
{
	name: 'text';
	text: string;
}

export function isTextBlock(obj: Block): obj is TextBlock
{
	return obj.name == 'text';
}

export interface InputNumberBlock extends Block
{
	name: 'inputNumber';
}

export function isInputNumberBlock(obj: Block): obj is InputNumberBlock
{
	return obj.name == 'inputNumber';
}

// Script

export interface ScriptArea extends Instruction
{
	op: 'setAiScript';
	content: string;
}

export function isScriptArea(obj: Instruction): obj is ScriptArea
{
	return obj.op == 'setAiScript';
}

//
// Meta
//

const metaDifinisions = ['aligncenter', 'title', 'name'];

export function validateMeta(meta: MetaInfo)
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
	validator: StringContext;
}

export const blockDifinisions: BlockDifinision[] = [
	{
		name: 'section',
		attrs: [
			{
				name: 'title',
				required: true,
				validator: $.str
			}
		]
	},
	{
		name: 'text',
		attrs: []
	},
	{
		name: 'inputNumber',
		attrs: [
			{
				name: 'variable',
				required: true,
				validator: $.str
			},
			{
				name: 'default',
				required: true,
				validator: $.str.match(/^[0-9]+$/)
			},
			{
				name: 'title',
				required: false,
				validator: $.str
			}
		]
	},
];

export function validateBlock(block: Block): void
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

		if (attrDef.validator.nok(attr.value)) {
			throw `${attrDef.name} attribute of ${block.name} block: invalid value "${attr.value}"`;
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
