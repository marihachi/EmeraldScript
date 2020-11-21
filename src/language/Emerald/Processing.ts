import { printDebug } from '../../Debug';
import * as Hpml from '../Hpml';
import { PropDef, propDefs } from './block';
import { BlockNode, Node } from './node';

export class ProcessingContext
{
	public page: Hpml.Page;
	public parentBlockContainer: Hpml.Block[] = [];
	public childBlockContainer: Hpml.Block[] = [];
	public contentVars: string[] = [];

	constructor(page: Hpml.Page)
	{
		this.page = page;
	}
}

function processProp(node: BlockNode, defs: PropDef[])
{
	// check name and type of property
	for (const [propName, propValue] of node.props) {
		const propDef = defs.find(p => p.name == propName);
		if (!propDef) {
			throw `${propName} property is invalid for ${node.name} block`;
		}

		if (propDef.validator.nok(propValue)) {
			throw `"${propValue}" is invalid value for ${propName} property of ${node.name} block`;
		}
	}

	for (const propDef of defs) {
		const hasProp = node.props.has(propDef.name);
		if (propDef.required) {
			if (!hasProp) {
				throw `${propDef.name} property is required for ${node.name} block`;
			}
		}
		else {
			if (!hasProp) {
				node.props.set(propDef.name, propDef.defaultValue);
			}
		}
	}
}

export function processNode(node: Node, ctx: ProcessingContext): void
{
	if (node.type == 'block') {
		printDebug('type: block');

		// process inner blocks
		if (node.children) {
			printDebug('the block is container');
			const parentContainer = ctx.parentBlockContainer;
			ctx.parentBlockContainer = [];
			printDebug('begin children processing');
			for (const child of node.children) {
				processNode(child, ctx);
			}
			printDebug('end children processing');
			ctx.childBlockContainer = ctx.parentBlockContainer;
			ctx.parentBlockContainer = parentContainer;
		}

		switch (node.name) {
			case 'section': {
				processProp(node, propDefs.section);
				const titleProp = node.props.get('title')!;
				const hpmlBlock = Hpml.generateSectionBlock(titleProp, ctx.childBlockContainer);
				ctx.parentBlockContainer.push(hpmlBlock);
				break;
			}
			case 'inputNumber': {
				processProp(node, propDefs.inputNumber);
				const variableProp = node.props.get('variable')!;
				const defaultProp = node.props.get('default')!;
				const titleProp = node.props.get('title')!;
				if (ctx.childBlockContainer.length > 0) {
					throw 'inputNumber block cannot have child blocks';
				}
				const hpmlBlock = Hpml.generateNumberInputBlock(
					variableProp,
					parseInt(defaultProp, 10),
					titleProp
				);
				ctx.parentBlockContainer.push(hpmlBlock);
				ctx.contentVars.push(variableProp);
				break;
			}
			default: {
				throw `processing error: ${node.name} block is not supported`;
			}
		}
	}
	else if (node.type == 'plain') {
		printDebug('type: plain');

		const hpmlBlock = Hpml.generateTextBlock(node.value);
		ctx.parentBlockContainer.push(hpmlBlock);
	}
	else if (node.type == 'meta') {
		printDebug('type: meta');

		switch (node.name) {
			case 'aligncenter': {
				printDebug('align center');
				ctx.page.alignCenter = true;
				break;
			}
			case 'title': {
				printDebug('title');
				ctx.page.title = node.value;
				break;
			}
			case 'name': {
				printDebug('name');
				ctx.page.name = node.value;
				break;
			}
			default: {
				throw `processing error: meta "${node.name}" is not supported`;
			}
		}
	}
	else if (node.type == 'script') {
		printDebug('instruction type: set AiScript');

		ctx.page.script = node.content;
	}
	else {
		throw `processing error: ${(node as Node).type} node is not supported`;
	}
}
