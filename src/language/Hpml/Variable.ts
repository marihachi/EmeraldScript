import { v4 as uuid } from 'uuid';

export interface IVariable
{
	id: string;
	type: string;
	name: string;
	value: string;
}

export interface IAiScriptVariable extends IVariable
{
	type: 'aiScriptVar';
}

export function generateAiScriptVariable(name: string): IAiScriptVariable
{
	return {
		id: uuid(),
		name: name,
		type: 'aiScriptVar',
		value: name
	};
}
