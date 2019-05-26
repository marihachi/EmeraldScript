start = parts

// general

space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak

// define meta

metaTypeChar = !(lineBreak / space) c:. { return c; }

metaContentChar = !(lineBreak) c:. { return c; }

defineMeta = "#" type:$(metaTypeChar+) space+ content:$(metaContentChar+) {
	return { metaType: type, value: content };
}

defineMetaPart
	= head:defineMeta items:(lineBreak item:defineMeta { return item; })* { return [head, ...items]; }
	/ "" { return []; }

// text literal

textLiteralChar = !(lineBreak / [\t"]) c:. { return c; }

textLiteral = "\"" text:$(textLiteralChar*) "\"" { return { exprType: 'text', value: text }; }

// number literal

numberLiteral = head:[1-9] ns:$([0-9]*) { return { exprType: 'number', value: head + ns }; }

// var identifier

varIdentifierChar = !(lineBreak / space / ";") c:. { return c; }

varIdentifier = identifier:$(varIdentifierChar+) { return { exprType: 'identifier', value: identifier }; }

// var expression

varExpression = textLiteral / numberLiteral / varIdentifier

// define var

varDefIdChar = !(lineBreak / space / ":") c:. { return c; }

varDefTypeChar = !(lineBreak / space / "=") c:. { return c; }

defineVar
	= "var"i spacing+ name:$(varDefIdChar+) spacing* ":" spacing* type:$(varDefTypeChar+) spacing* "=" spacing* expr:varExpression ";" {
	return { name: name, varType: type, value: expr };
}

defineVarPart
	= head:defineVar items:(lineBreak item:defineVar { return item; })* { return [head, ...items]; }
	/ "" { return []; }

// block attribute

blockAttrIdChar = !(lineBreak / space / "=") c:. { return c; }

blockAttrContentTextChar = !(lineBreak / "\"") c:. { return c; }

blockAttrContentText = "\"" text:$(blockAttrContentTextChar*) "\"" { return { attrContentType: 'text', value: text }; }

blockAttrContent = blockAttrContentText

blockAttrItem = type:$(blockAttrIdChar+) spacing* "=" spacing* content:blockAttrContent {
	return { attrType: type, content: content };
}

blockAttr
	= head:blockAttrItem items:(spacing* item:blockAttrItem { return item; })* { return [head, ...items]; }
	/ "" { return []; }

// section block

beginSectionBlock = "<section"i attrs2:(spacing+ attrs:blockAttr spacing* { return attrs; })? ">" { return attrs2 || []; }

endSectionBlock = "</section>"i

sectionBlock = attrs:beginSectionBlock spacing* blocks:blockArea spacing* endSectionBlock {
	return { blockType: 'section', attrs: attrs, children: blocks };
}

// text block

textBlockContentChar = !(endTextBlock) c:. { return c; }

beginTextBlock = "<text"i attrs2:(spacing+ attrs:blockAttr spacing* { return attrs; })? ">" { return attrs2 || []; }

endTextBlock = "</text>"i

textBlock = attrs:beginTextBlock spacing* text:$(textBlockContentChar*) spacing* endTextBlock {
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
