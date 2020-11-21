import { v4 as uuid } from 'uuid';

//
// Block
//

// SectionBlock

export type SectionBlock = {
	id: string;
	type: 'section';
	title: string;
	children: Block[];
}

export function generateSectionBlock(title: string, children: Block[]): SectionBlock
{
	return {
		id: uuid(),
		type: 'section',
		title: title,
		children: children
	};
}

// TextBlock

export type TextBlock = {
	id: string;
	type: 'text';
	text: string;
}

export function generateTextBlock(text: string): TextBlock
{
	return {
		id: uuid(),
		type: 'text',
		text: text
	};
}

// NumberInputBlock

export type NumberInputBlock = {
	id: string;
	type: 'numberInput';
	default: number;
	name: string;
	text: string;
}

export function generateNumberInputBlock(variable: string, defaultValue: number, title: string): NumberInputBlock
{
	return {
		id: uuid(),
		type: 'numberInput',
		name: variable,
		default: defaultValue,
		text: title
	};
}

export type Block
	= SectionBlock | TextBlock | NumberInputBlock;

//
// Variable
//

export type AiScriptVariable = {
	id: string;
	type: 'aiScriptVar';
	name: string;
	value: string;
}

export function generateAiScriptVariable(name: string): AiScriptVariable
{
	return {
		id: uuid(),
		name: name,
		type: 'aiScriptVar',
		value: name
	};
}

export type Variable
	= AiScriptVariable;

// Page

export type Page = {
	title: string;
	name: string;
	alignCenter?: boolean;
	content: Block[];
	variables: Variable[];
	script: string;
};

export function generatePage(title?: string, name?: string): Page
{
	const pageId = uuid();
	return {
		title: title ?? pageId,
		name: name ?? pageId,
		alignCenter: false,
		content: [],
		variables: [],
		script: ''
	};
}
