import $, { StringContext } from 'cafy';
import * as Emerald from '..';
import * as Hpml from '../../Hpml';
import { printDebug } from '../../../debug';

export function processBlock(block: Emerald.Block, ctx: Emerald.ProcessingContext): void
{
	// check block name
	const blockDef = Emerald.blockDifinisions.find((def) => block.name == def.name);
	if (!blockDef) {
		throw `processing error: ${block.name} block is not supported`;
	}

	// check name and type of attributes
	for (const attr of block.attrs) {
		const attrDef = blockDef.attrs.find(at => at.name == attr.name);
		if (!attrDef) {
			throw `processing error: ${attr.name} attribute is invalid for ${block.name} block`;
		}

		if (attrDef.validator.nok(attr.value)) {
			throw `processing error: invalid value "${attr.value}" is invalid value for ${attr.name} attribute of ${block.name} block`;
		}
	}

	// check required attributes
	const requiredAttrDefs = blockDef.attrs.filter(def => def.required);
	for (const attrDef of requiredAttrDefs) {
		const attr = block.attrs.find(at => at.name == attrDef.name);
		if (!attr) {
			throw `${attrDef.name} attribute is required for ${blockDef.name} block`;
		}
	}

	// process inner blocks
	if (Emerald.isContainerBlock(block)) {
		printDebug('the block is container');
		const parentContainer = ctx.parentBlockContainer;
		ctx.parentBlockContainer = [];
		printDebug('begin children processing');
		for (const child of block.children) {
			Emerald.process(child, ctx);
		}
		printDebug('end children processing');
		ctx.childBlockContainer = ctx.parentBlockContainer;
		ctx.parentBlockContainer = parentContainer;
	}

	printDebug(`block type: ${block.name}`);
	// process the setBlock block
	blockDef.process(block, ctx);
}

// block difinision

export interface BlockDifinision
{
	name: string;
	attrs: {
		name: string;
		required: boolean;
		validator: StringContext;
	}[];
	process: (block: Block, ctx: Emerald.ProcessingContext) => void;
}

export const blockDifinisions: BlockDifinision[] = [];

// abstract block

export interface Block extends Emerald.Instruction
{
	type: 'block';
	name: string;
	attrs: {
		name: string;
		valueType: string;
		value: string;
	}[];
}

export function isBlock(obj: Emerald.Instruction): obj is Emerald.Block
{
	return obj.type == 'block';
}

export interface ContainerBlock extends Emerald.Block
{
	children: Emerald.Instruction[];
}

export function isContainerBlock(obj: Block): obj is Emerald.ContainerBlock
{
	return (obj as any).children != null;
}

// SectionBlock

export interface SectionBlock extends Emerald.ContainerBlock
{
	name: 'section';
}

export function isSectionBlock(obj: Emerald.Block): obj is Emerald.SectionBlock
{
	return obj.name == 'section';
}

const sectionBlockDef: BlockDifinision = {
	name: 'section',
	attrs: [
		{
			name: 'title',
			required: true,
			validator: $.str
		}
	],
	process(block: Emerald.Block, ctx: Emerald.ProcessingContext): void
	{
		const section = (block as Emerald.SectionBlock);
		const titleAttr = section.attrs.find(attr => attr.name == 'title')!;
		const hpmlBlock = Hpml.generateSectionBlock(titleAttr.value, ctx.childBlockContainer);
		ctx.parentBlockContainer.push(hpmlBlock);
	}
};
blockDifinisions.push(sectionBlockDef);

// TextBlock

export interface TextBlock extends Emerald.Block
{
	name: 'text';
	text: string;
}

export function isTextBlock(obj: Emerald.Block): obj is Emerald.TextBlock
{
	return obj.name == 'text';
}

const textBlockDef: BlockDifinision = {
	name: 'text',
	attrs: [],
	process(block: Emerald.Block, ctx: Emerald.ProcessingContext): void
	{
		const textBlock = (block as Emerald.TextBlock);
		const hpmlBlock = Hpml.generateTextBlock(textBlock.text);
		ctx.parentBlockContainer.push(hpmlBlock);
	}
};
blockDifinisions.push(textBlockDef);

// InputNumberBlock

export interface InputNumberBlock extends Emerald.Block
{
	name: 'inputNumber';
}

export function isInputNumberBlock(obj: Emerald.Block): obj is Emerald.InputNumberBlock
{
	return obj.name == 'inputNumber';
}

const inputNumberBlockDef: BlockDifinision = {
	name: 'inputNumber',
	attrs: [
		{
			name: 'variable',
			required: true,
			validator: $.str.min(1)
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
	],
	process(block: Emerald.Block, ctx: Emerald.ProcessingContext): void
	{
		const inputNumberBlock = (block as Emerald.InputNumberBlock);
		const variableAttr = inputNumberBlock.attrs.find(attr => attr.name == 'variable')!;
		const defaultAttr = inputNumberBlock.attrs.find(attr => attr.name == 'default')!;
		const titleAttr = inputNumberBlock.attrs.find(attr => attr.name == 'title');
		if (ctx.childBlockContainer.length > 0) {
			throw 'inputNumber block: children blocks are not supported';
		}

		const hpmlBlock = Hpml.generateNumberInputBlock(
			variableAttr.value,
			parseInt(defaultAttr.value, 10),
			titleAttr ? titleAttr.value : ''
		);
		ctx.parentBlockContainer.push(hpmlBlock);

		ctx.contentVars.push(variableAttr.value);
	}
};
blockDifinisions.push(inputNumberBlockDef);
