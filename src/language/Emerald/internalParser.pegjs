start = parts

//
// parts
//

parts = spacing* metas:defineMetaPart? spacing* contents:contentPart? spacing* script:scriptPart? spacing* {
	const ast = [];
	if (metas) ast.push(...metas);
	if (contents) ast.push(...contents);
	if (script) ast.push(script);
	return ast;
}

//
// meta
//

defineMetaPart
	= head:(defineMeta_A / defineMeta_B) items:(lineBreak item:(defineMeta_A / defineMeta_B) { return item; })* { return [head, ...items]; }
	/ "" { return []; }

defineMeta_A = "#" name:$(defineMeta_nameChar+) space+ content:$(defineMeta_contentChar+) {
	return { type: 'meta', name: name.toLowerCase(), value: content };
}

defineMeta_B = "#" name:$(defineMeta_nameChar+) {
	return { type: 'meta', name: name.toLowerCase(), value: null };
}

defineMeta_contentChar = !(lineBreak) . { return text(); }

defineMeta_nameChar = !(lineBreak / space) . { return text(); }

//
// content
//

contentPart = contentArea

contentArea
	= head:content items:(spacing* item:content { return item; })* { return [head, ...items]; }
	/ "" { return []; }

content = sectionBlock / inputNumberBlock / plainText

// section block

sectionBlock = attrs:sectionBlock_begin spacing* children:contentArea spacing* sectionBlock_end {
	const attrMap = new Map();
	for (const attr of attrs) {
		attrMap.set(attr.key, attr.value);
	}
	console.log('children:', children);
	return { type: 'block', name: 'section', props: attrMap, children: children || [] };
}

sectionBlock_begin = "<section" attrs2:(spacing+ attrs:blockAttrs spacing* { return attrs; })? ">" { return attrs2 || []; }

sectionBlock_end = "</section>"

// inputNumber block

inputNumberBlock = attrs:inputNumberBlock_begin spacing* children:contentArea spacing* inputNumberBlock_end {
	const attrMap = new Map();
	for (const attr of attrs) {
		attrMap.set(attr.key, attr.value);
	}
	return { type: 'block', name: 'inputNumber', props: attrMap, children: children || [] };
}

inputNumberBlock_begin = "<inputNumber" attrs2:(spacing+ attrs:blockAttrs spacing* { return attrs; })? ">" { return attrs2 || []; }

inputNumberBlock_end = "</inputNumber>"

// block attribute

blockAttrs
	= head:blockAttr items:(spacing* item:blockAttr { return item; })* { return [head, ...items]; }
	/ "" { return []; }

blockAttr = key:$(blockAttr_keyChar+) spacing* "=" spacing* value:stringLiteral {
	return { key, value };
}

blockAttr_keyChar = !(lineBreak / space / "=") . { return text(); }

// plain text

plainText = (!(inputNumberBlock_begin / sectionBlock_end / inputNumberBlock_begin / inputNumberBlock_end / scriptPart_begin) .)+ {
	const value = text().replace(/\t/, '');
	return { type: 'plain', value: value };
}

// script

scriptPart = scriptPart_begin content:scriptPart_content scriptPart_end {
	return {
		type: 'script',
		content: content
	};
}

scriptPart_content = (!(scriptPart_end) .)* { return text(); }

scriptPart_begin = "<script>"i lineBreak?

scriptPart_end = lineBreak? "</script>"i

//
// general
//

stringLiteral
	= "\"" value:$(stringLiteral_char*) "\"" { return value; }
stringLiteral_char
	= !(lineBreak / "\"") . { return text(); }
space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak
