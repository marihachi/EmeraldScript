export interface INode {
	type: string;
}

//
// Variable
//

export interface IVariableDef extends INode {
	type: 'def';
	name: string;
	expr: INode;
	mut: boolean;
}

export function isVariableDef(obj: INode): obj is IVariableDef
{
	return obj.type == 'def';
}
