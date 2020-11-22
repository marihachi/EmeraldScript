import { parse as parseAiScript } from '@syuilo/aiscript';
import * as AiNode from '@syuilo/aiscript/built/node';
import * as AiValue from '@syuilo/aiscript/built/interpreter/value';
import * as Hpml from '../hpml';
import { parse as parseEmeraldScript } from './parser';
import { ProcessingContext, processNode } from './processing';

function generateCode(aiNodes: AiNode.Node[], ctx: ProcessingContext)
{
	const aiVars: AiNode.NDef[] = [];
	const aiHandlers: AiNode.Node[] = [];
	for (const aiNode of aiNodes) {
		if (aiNode.type == 'def') {
			if (aiNode.expr.type == 'fn') {
				aiHandlers.push(aiNode);
			}
			else {
				aiVars.push(aiNode);
			}
		}
	}

	// automated HPML variable generation
	for (const aiVar of aiVars) {
		if (!ctx.contentVars.some(v => v == aiVar.name)) {
			// generate a page variable of the AiScript variable
			const aiScriptVar = Hpml.generateAiScriptVariable(aiVar.name);
			ctx.page.variables.push(aiScriptVar);
		}
	}

	// automated AiScript code generation
	if (ctx.contentVars.length > 0) {
		let generatedCode = '\n';
		generatedCode += '@_generated_onPagesUpdated(name, value) {\n';
		for (const contentVar of ctx.contentVars) {
			if (aiVars.some(n => n.name == contentVar && n.mut)) {
				generatedCode += `\t? (name = "${contentVar}") { ${contentVar} <- value }\n`;
			}
		}
		generatedCode += '}\n';
		generatedCode += 'MkPages:updated(_generated_onPagesUpdated)\n';
		ctx.page.script += generatedCode;
	}
}

/**
 * compile an EmeraldScript code
*/
export function compile(emeraldScriptCode: string): string
{
	const ctx = new ProcessingContext(Hpml.generatePage());
	ctx.parentBlockContainer = ctx.page.content;

	// parse EmeraldScript code
	const nodes = parseEmeraldScript(emeraldScriptCode, { });

	// process nodes
	for (const node of nodes) {
		processNode(node, ctx);
	}

	// parse AiScript code
	let aiNodes: AiNode.Node[];
	try {
		aiNodes = parseAiScript(ctx.page.script) ?? [];
	}
	catch (err) {
		throw `parsing error: Failed to parse the AiScript`;
	}

	generateCode(aiNodes, ctx);

	return JSON.stringify(ctx.page);
}
