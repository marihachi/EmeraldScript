start = parts

//
// general
//

space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak

identifier_char = !(spacing / [+*/%;()=<>'`",!@-]) c:. { return c; }

textLine_char = !(lineBreak / [\t"]) c:. { return c; }

number = head:[1-9] ns:$([0-9]*) { return head + ns; }

//
// meta part
//

defineMeta_typeChar = !(lineBreak / space) c:. { return c; }

defineMeta_contentChar = !(lineBreak) c:. { return c; }

defineMeta_A = "#" type:$(defineMeta_typeChar+) space+ content:$(defineMeta_contentChar+) {
	return { metaType: type.toLowerCase(), value: content };
}

defineMeta_B = "#" type:$(defineMeta_typeChar+) {
	return { metaType: type.toLowerCase(), value: null };
}

defineMetaPart
	= head:(defineMeta_A / defineMeta_B) items:(lineBreak item:(defineMeta_A / defineMeta_B) { return item; })* { return [head, ...items]; }
	/ "" { return []; }

//
// statement part
//

// literal value: text
textLiteral = "\"" text:$(textLine_char*) "\"" { return { exprType: 'literal', literalType: 'text', value: text }; }

// literal value: number
numberLiteral = num:number { return { exprType: 'literal', literalType: 'number', value: num }; }

// value: variable reference
variableReference = identifier:$(identifier_char+) { return { exprType: 'ref', value: identifier }; }

// value: loop function
loopFunction_left = "(" spacing* slot:$(identifier_char+) spacing+ "to"i spacing+ times:number spacing* ")" {
	return { slot, times };
}

loopFunction = left:loopFunction_left spacing* "=>" spacing* expr:expression {
	return { exprType: 'loop-func', slot: left.slot, times: left.times, expr };
}

// value: user defined function
userFunction_args =
	head:$(identifier_char+) items:(spacing* ',' spacing* item:$(identifier_char+) { return item; })* { return [head, ...items]; }

userFunction = "(" spacing* args:userFunction_args spacing* ")" spacing* "=>" spacing* expr:expression {
	return { exprType: 'func', args, expr };
}

// TODO: function call

// math operation: add
addOperation = left:(numberLiteral / variableReference) spacing* "+" spacing* right:(numberLiteral / variableReference) {
	return { exprType: 'add', left, right };
}

// math operation: subtract
subtractOperation = left:(numberLiteral / variableReference) spacing* "-" spacing* right:(numberLiteral / variableReference) {
	return { exprType: 'subtract', left, right };
}

// math operation: multiply
multiplyOperation = left:(numberLiteral / variableReference) spacing* "*" spacing* right:(numberLiteral / variableReference) {
	return { exprType: 'multiply', left, right };
}

// math operation: divide
divideOperation = left:(numberLiteral / variableReference) spacing* "/" spacing* right:(numberLiteral / variableReference) {
	return { exprType: 'divide', left, right };
}

// expression

valueExpr = textLiteral / numberLiteral / userFunction / loopFunction / variableReference

mathOperationExpr = addOperation / subtractOperation / multiplyOperation / divideOperation

expression = mathOperationExpr / valueExpr

// statement: define variable

defineVar
	= name:$(identifier_char+) spacing* "=" spacing* expr:expression ";" {
	return { statementType: 'variable', name, expr };
}

statement = defineVar

statementPart
	= head:statement items:(lineBreak item:statement { return item; })* { return [head, ...items]; }
	/ "" { return []; }

//
// block part
//

// block attribute

blockAttr_content_text = "\"" text:$(textLine_char*) "\"" { return { attrContentType: 'text', value: text }; }

blockAttr_content = blockAttr_content_text

blockAttr = type:$(identifier_char+) spacing* "=" spacing* content:blockAttr_content {
	return { attrType: type, content: content };
}

blockAttrs
	= head:blockAttr items:(spacing* item:blockAttr { return item; })* { return [head, ...items]; }
	/ "" { return []; }

// section block

sectionBlock_begin = "<section"i attrs2:(spacing+ attrs:blockAttrs spacing* { return attrs; })? ">" { return attrs2 || []; }

sectionBlock_end = "</section>"i

sectionBlock = attrs:sectionBlock_begin spacing* blocks:blockArea spacing* sectionBlock_end {
	return { blockType: 'section', attrs: attrs, children: blocks };
}

// text block

textBlock_contentChar = !(textBlock_end) c:. { return c; }

textBlock_begin = "<text"i attrs2:(spacing+ attrs:blockAttrs spacing* { return attrs; })? ">" { return attrs2 || []; }

textBlock_end = "</text>"i

textBlock = attrs:textBlock_begin spacing* text:$(textBlock_contentChar*) spacing* textBlock_end {
	text = text.replace(/\t/, '');
	return { blockType: 'text', attrs: attrs, text: text };
}

block = sectionBlock / textBlock

blockArea
	= head:block items:(spacing* item:block { return item; })* { return [head, ...items]; }
	/ "" { return []; }

blockPart = blockArea

//
// parts
//

parts = spacing* metas:defineMetaPart spacing* statements:statementPart spacing* blocks:blockPart spacing* {
	return { metas: metas, statements: statements, blocks: blocks };
}
