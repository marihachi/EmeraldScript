import $, { StringContext } from 'cafy';

// Node

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

export type ScriptNode = {
	type: 'script';
	content: string;
};

export type PlainNode = {
	type: 'plain';
	value: string;
};

export type Node
	= MetaNode | BlockNode | ScriptNode | PlainNode;

// Property for Block node

export type OptionalBlockProp = {
	name: string;
	required: false;
	validator: StringContext;
	defaultValue: any;
};

export type RequiredBlockProp = {
	name: string;
	required: true;
	validator: StringContext;
};

export type BlockProp
	= OptionalBlockProp | RequiredBlockProp;

export const blockProps = {
	section: [
		{ name: 'title', required: true, validator: $.str }
	] as BlockProp[],
	inputNumber: [
		{ name: 'variable', required: true, validator: $.str.min(1) },
		{ name: 'default', required: true, validator: $.str.match(/^[0-9]+$/) },
		{ name: 'title', required: false, validator: $.str, defaultValue: '' }
	] as BlockProp[]
};
