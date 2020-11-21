export type MetaNode = {
	type: 'meta';
	name: string;
	value: string;
};

export type BlockNode = {
	type: 'block';
	name: string;
	props: Map<string, string>;
	children: Node[];
};

export type AiScriptAreaNode = {
	type: 'script';
	content: string;
};

export type PlainNode = {
	type: 'plain';
	value: string;
};

export type Node
	= MetaNode | BlockNode | AiScriptAreaNode | PlainNode;
