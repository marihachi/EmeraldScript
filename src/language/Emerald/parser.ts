import { Parser, ParserOptions, PegjsError } from 'pegjs';
import { Node } from './node';

const internalParser: Parser = require('./syntax.js');

export function parse(input: string, options: ParserOptions): Node[]
{
	let nodes: Node[];
	try {
		nodes = internalParser.parse(input, options);
	}
	catch (err) {
		if (err.name == 'SyntaxError') {
			const syntaxErr = err as PegjsError;
			throw `parsing error: Failed to parse the EmeraldScript (location ${syntaxErr.location.start.line}:${syntaxErr.location.start.column})`;
		}
		else {
			throw err;
		}
	}

	return nodes;
}
