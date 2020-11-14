import { PegjsError, Parser } from 'pegjs';
import * as Emerald from '.';
import * as Hpml from '../Hpml';

const emeraldParser: Parser = require('./parser.js');

export interface Instruction
{
	op: string;
}

export class HpmlTranspiler
{
	/**
	 * transpile an EmeraldScript code to a Hpml code
	*/
	transpile(emeraldScriptCode: string): string
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

		// generate a page
		const page = Hpml.generatePage(instructions);

		return JSON.stringify(page);
	}
}

export * from './Block';
export * from './Meta';
export * from './AiScriptArea';
