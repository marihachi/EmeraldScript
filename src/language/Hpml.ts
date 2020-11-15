import { v4 as uuid } from 'uuid';

// Block

export interface Block
{
	id: string;
	type: string;
}

// SectionBlock

export interface SectionBlock extends Block
{
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

export interface TextBlock extends Block
{
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

export interface NumberInputBlock extends Block
{
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

// Variable

export interface Variable
{
	id: string;
	type: string;
	name: string;
	value: string;
}

export interface AiScriptVariable extends Variable
{
	type: 'aiScriptVar';
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

// Page

export interface Page
{
	title: string;
	name: string;
	alignCenter?: boolean;
	content: Block[];
	variables: Variable[];
	script: string;
}

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
