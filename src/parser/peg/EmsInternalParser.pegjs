start = parts

// general

space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak

// define meta

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

// text literal

textLiteral_char = !(lineBreak / [\t"]) c:. { return c; }

textLiteral = "\"" text:$(textLiteral_char*) "\"" { return { exprType: 'text', value: text }; }

// number literal

numberLiteral = head:[1-9] ns:$([0-9]*) { return { exprType: 'number', value: head + ns }; }

// var identifier

varIdentifier_char = !(lineBreak / space / ";") c:. { return c; }

varIdentifier = identifier:$(varIdentifier_char+) { return { exprType: 'identifier', value: identifier }; }

// var expression

varExpression = textLiteral / numberLiteral / varIdentifier

// define var

defineVar_idChar = !(lineBreak / space / ":") c:. { return c; }

defineVar_typeChar = !(lineBreak / space / "=") c:. { return c; }

defineVar
	= "var"i spacing+ name:$(defineVar_idChar+) spacing* ":" spacing* type:$(defineVar_typeChar+) spacing* "=" spacing* expr:varExpression ";" {
	return { name: name, varType: type.toLowerCase(), value: expr };
}

defineVarPart
	= head:defineVar items:(lineBreak item:defineVar { return item; })* { return [head, ...items]; }
	/ "" { return []; }

// block attribute

blockAttr_idChar = !(lineBreak / space / "=") c:. { return c; }

blockAttr_content_textChar = !(lineBreak / "\"") c:. { return c; }

blockAttr_content_text = "\"" text:$(blockAttr_content_textChar*) "\"" { return { attrContentType: 'text', value: text }; }

blockAttr_content = blockAttr_content_text

blockAttr = type:$(blockAttr_idChar+) spacing* "=" spacing* content:blockAttr_content {
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

// block

block = sectionBlock / textBlock

blockArea
	= head:block items:(spacing* item:block { return item; })* { return [head, ...items]; }
	/ "" { return []; }

blockPart = blockArea

// parts

parts = spacing* metas:defineMetaPart spacing* vars:defineVarPart spacing* blocks:blockPart spacing* {
	return { metas: metas, vars: vars, blocks: blocks };
}
