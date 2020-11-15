import $, { StringContext } from 'cafy';
import * as Emerald from '..';
import * as Hpml from '../../Hpml';

export interface BlockDifinision
{
	name: string;
	attrs: {
		name: string;
		required: boolean;
		validator: StringContext;
	}[];
	evaluate: (block: Block, ctx: Emerald.EvaluationContext) => void;
}

export const blockDifinisions: BlockDifinision[] = [];

// abstract block

export interface Block extends Emerald.Instruction
{
	op: 'addBlock';
	name: string;
	attrs: {
		name: string;
		valueType: string;
		value: string;
	}[];
}

export function isBlock(obj: Emerald.Instruction): obj is Emerald.Block
{
	return obj.op == 'addBlock';
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
	evaluate(block: Emerald.Block, ctx: Emerald.EvaluationContext): void
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
	evaluate(block: Emerald.Block, ctx: Emerald.EvaluationContext): void
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
	evaluate(block: Emerald.Block, ctx: Emerald.EvaluationContext): void
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
