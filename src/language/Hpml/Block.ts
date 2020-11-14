import { v4 as uuid } from 'uuid';
import * as Emerald from '../Emerald';
import * as Hpml from '.';

export interface IBlock
{
	id: string;
	type: string;
}

/**
 * generate a block from EmeraldScript block
*/
export function generateBlock(instruction: Emerald.Block, ctx: Hpml.IPage): IBlock | null
{
	Emerald.validateBlock(instruction);

	// container block
	let children: IBlock[] = [];
	if (Emerald.isContainerBlock(instruction)) {
		for (const child of instruction.children) {
			const block = generateBlock(child, ctx);
			if (block != null) {
				children.push(block);
			}
		}
	}

	if (Emerald.isTextBlock(instruction)) {
		const block = generateTextBlock(instruction.text);
		return block;
	}
	else if (Emerald.isSectionBlock(instruction)) {
		const titleAttr = instruction.attrs.find(attr => attr.name == 'title')!;
		const block = generateSectionBlock(titleAttr.value, children);
		return block;
	}
	else if (Emerald.isInputNumberBlock(instruction)) {
		const variableAttr = instruction.attrs.find(attr => attr.name == 'variable')!;
		const defaultAttr = instruction.attrs.find(attr => attr.name == 'default')!;
		const titleAttr = instruction.attrs.find(attr => attr.name == 'title');
		if (children.length > 0) {
			throw 'inputNumber block: children blocks are not supported';
		}
		const block = generateNumberInputBlock(
			variableAttr.value,
			parseInt(defaultAttr.value, 10),
			titleAttr ? titleAttr.value : ''
		);
		return block;
	}

	return null;
}

export interface ISectionBlock extends IBlock
{
	type: 'section';
	title: string;
	children: IBlock[];
}

export function generateSectionBlock(title: string, children: IBlock[]): ISectionBlock
{
	return {
		id: uuid(),
		type: 'section',
		title: title,
		children: children
	};
}

export interface ITextBlock extends IBlock
{
	type: 'text';
	text: string;
}

export function generateTextBlock(text: string): ITextBlock
{
	return {
		id: uuid(),
		type: 'text',
		text: text
	};
}

export interface INumberInputBlock extends IBlock
{
	type: 'numberInput';
	default: number;
	name: string;
	text: string;
}

export function generateNumberInputBlock(variable: string, defaultValue: number, title: string): INumberInputBlock
{
	return {
		id: uuid(),
		type: 'numberInput',
		name: variable,
		default: defaultValue,
		text: title
	};
}
