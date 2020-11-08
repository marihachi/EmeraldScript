import { v4 as uuid } from 'uuid';

export interface PageObject
{
	title: string;
	name: string;
	alignCenter?: boolean;
	content: PageBlock[];
	variables: PageVar[];
	script: string;
}

export interface PageBlock
{
	id: string;
	type: string;
}

export interface PageSectionBlock extends PageBlock
{
	type: 'section';
	title: string;
	children: PageBlock[];
}

export interface PageTextBlock extends PageBlock
{
	type: 'text';
	text: string;
}

export interface PageNumberInputBlock extends PageBlock
{
	type: 'numberInput';
	default: number;
	name: string;
	text: string;
}

export interface PageVar
{
	id: string;
	type: string;
	name: string;
	value: string;
}

export interface AiScriptPageVar
{
	id: string;
	name: string;
	type: 'aiScriptVar';
	value: string;
}

export function generatePageTextBlock(text: string): PageTextBlock
{
	return {
		id: uuid(),
		type: 'text',
		text: text
	};
}

export function generatePageSectionBlock(title: string, children: PageBlock[]): PageSectionBlock
{
	return {
		id: uuid(),
		type: 'section',
		title: title,
		children: children
	};
}

export function generatePageNumberInputBlock(variable: string, defaultValue: number, title: string): PageNumberInputBlock
{
	return {
		id: uuid(),
		type: 'numberInput',
		name: variable,
		default: defaultValue,
		text: title
	};
}

//
// Variable
//

export function generatePageVarOfAiScript(name: string): AiScriptPageVar
{
	return {
		id: uuid(),
		name: name,
		type: 'aiScriptVar',
		value: name
	};
}
