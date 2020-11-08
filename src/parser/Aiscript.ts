
export interface AiNode {
	type: string;
}

export interface AiVarDef {
	type: 'def';
	name: string;
	expr: AiNode;
	mut: boolean;
}

export function isAiVarDef(obj: AiNode): obj is AiVarDef
{
	return obj.type == 'def';
}
