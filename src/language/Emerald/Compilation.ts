import { PegjsError, Parser } from 'pegjs';
import { parse as parseAiScript } from '@syuilo/aiscript';
import * as Ai from '../Ai';
import * as Emerald from '.';
import * as Hpml from '../Hpml';
import { printDebug } from '../../debug';

const emeraldParser: Parser = require('./parser.js');

export class Compiler
{
	/**
	 * compile an EmeraldScript code
	*/
	compile(emeraldScriptCode: string): string
	{
		// generate EmeraldScript instructions
		let instructions: Emerald.Instruction[];
		try {
			instructions = emeraldParser.parse(emeraldScriptCode, { });
		}
		catch (err) {
			const syntaxErr = err as PegjsError;
			throw `parsing faild (location ${syntaxErr.location.start.line}:${syntaxErr.location.start.column})`;
		}

		// prepare context
		const ctx: Emerald.ProcessingContext = {
			page: Hpml.generatePage(),
			parentBlockContainer: [],
			childBlockContainer: [],
			contentVars: []
		};
		ctx.parentBlockContainer = ctx.page.content;

		// process instructions
		for (const instruction of instructions) {
			Emerald.process(instruction, ctx);
		}

		let aiNodes: Ai.Node[];
		try {
			aiNodes = parseAiScript(ctx.page.script) ?? [];
		}
		catch (err) {
			throw `Faild to parse the AiScript`;
		}

		const aiVars: { name: string, mut: boolean }[] = [];
		for (const aiNode of aiNodes) {
			if (Ai.isVariableDef(aiNode)) {
				aiVars.push({ name: aiNode.name, mut: aiNode.mut });
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

		printDebug('');

		return JSON.stringify(ctx.page);
	}
}
