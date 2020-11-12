import { PegjsError, Parser } from 'pegjs';
import { AstInstruction } from './ScriptAst';
import { PageObject } from './Page';
import { generatePage } from './PageGenerator';

const internalParser: Parser = require('./peg/EmsInternalParser.js');

export default class EmsParser
{
	parse(inputCode: string): PageObject
	{
		// generate EmeraldScript instructions
		let ast: AstInstruction[];
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
