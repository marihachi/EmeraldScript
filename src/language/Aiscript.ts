export interface Node {
	type: string;
}

//
// Variable
//

export interface VariableDef extends Node {
	type: 'def';
	name: string;
	expr: Node;
	mut: boolean;
}

export function isVariableDef(obj: Node): obj is VariableDef
{
	return obj.type == 'def';
}
