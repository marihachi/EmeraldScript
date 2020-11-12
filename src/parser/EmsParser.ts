import { PegjsError, Parser } from 'pegjs';
import * as Script from './ScriptAst';
import * as Page from './Page';
import { generatePage } from './PageGenerator';

const internalParser: Parser = require('./peg/EmsInternalParser.js');

export default class EmsParser
{
	parse(inputCode: string): Page.DefinitionData
	{
		// generate EmeraldScript instructions
		let ast: Script.Instruction[];
		try {
			ast = internalParser.parse(inputCode, { });
		}
		catch (err) {
			const syntaxErr = err as PegjsError;
			throw `syntax error (location ${syntaxErr.location.start.line}:${syntaxErr.location.start.column})`;
		}

		return generatePage(ast);
	}
}
