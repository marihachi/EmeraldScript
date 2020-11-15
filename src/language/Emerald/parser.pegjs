start = parts

//
// parts
//

parts = spacing* metas:defineMetaPart? spacing* blocks:blockPart? spacing* script:scriptPart? spacing* {
	const ast = [];
	if (metas) ast.push(...metas);
	if (blocks) ast.push(...blocks);
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
// block
//

blockPart = blockArea

blockArea
	= head:block items:(spacing* item:block { return item; })* { return [head, ...items]; }
	/ "" { return []; }

block = sectionBlock / textBlock / inputNumberBlock

// section block

sectionBlock = attrs:sectionBlock_begin spacing* blocks:blockArea spacing* sectionBlock_end {
	return { type: 'block', name: 'section', attrs: attrs, children: blocks };
}

sectionBlock_begin = "<section" attrs2:(spacing+ attrs:blockAttrs spacing* { return attrs; })? ">" { return attrs2 || []; }

sectionBlock_end = "</section>"

// text block

textBlock = attrs:textBlock_begin spacing* text:$(textBlock_contentChar*) spacing* textBlock_end {
	text = text.replace(/\t/, '');
	return { type: 'block', name: 'text', attrs, text };
}

textBlock_contentChar = !(textBlock_end) c:. { return c; }

textBlock_begin = "<text" attrs2:(spacing+ attrs:blockAttrs spacing* { return attrs; })? ">" { return attrs2 || []; }

textBlock_end = "</text>"

// inputNumber block

inputNumberBlock = attrs:inputNumberBlock_begin spacing* blocks:blockArea spacing* inputNumberBlock_end {
	return { type: 'block', name: 'inputNumber', attrs: attrs, children: blocks };
}

inputNumberBlock_begin = "<inputNumber" attrs2:(spacing+ attrs:blockAttrs spacing* { return attrs; })? ">" { return attrs2 || []; }

inputNumberBlock_end = "</inputNumber>"

// block attribute

blockAttrs
	= head:blockAttr items:(spacing* item:blockAttr { return item; })* { return [head, ...items]; }
	/ "" { return []; }

blockAttr = name:$(blockAttr_idChar+) spacing* "=" spacing* content:blockAttr_content {
	return { name, ...content };
}

blockAttr_content = blockAttr_content_text

blockAttr_content_text = "\"" text:$(blockAttr_content_textChar*) "\"" { return { valueType: 'string', value: text }; }

blockAttr_content_textChar = !(lineBreak / "\"") . { return text(); }

blockAttr_idChar = !(lineBreak / space / "=") . { return text(); }

//
// script
//

scriptPart = scriptBlock_begin content:scriptBlock_content scriptBlock_end {
	return {
		type: 'script',
		content: content
	};
}

scriptBlock_content = (!(scriptBlock_end) .)* { return text(); }

scriptBlock_begin = "<script>"i lineBreak?

scriptBlock_end = lineBreak? "</script>"i

//
// general
//

space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak
