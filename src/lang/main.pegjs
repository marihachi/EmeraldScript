start = meta:defineMetaPart vars:defineVarPart {
	meta.reverse();
	return {
		title: meta.find(el => el.type == 'title').value,
		name: meta.find(el => el.type == 'name').value,
		variables: vars,
		content: []
	};
}

breakLine = [\r\n]
space = [ \t]
delimit = breakLine / space

//
// meta
//

defineMetaPart = items:(defineMetaName / defineMetaTitle / delimit)* {
	return items.filter(el => typeof el == 'object');
}

defineMetaName = "#name" delimit+ nameChars:(!([\t\r\n]) .)+ breakLine {
	return { type: 'name', value: nameChars.map(el => el[1]).join('') };
}

defineMetaTitle = "#title" delimit+ titleChars:(!([\t\r\n]) .)+ breakLine {
	return { type: 'title', value: titleChars.map(el => el[1]).join('') };
}

//
// variable
//

defineVarPart = items:(defineTextVar / defineNumberVar / defineRefVar / delimit)* {
	return items.filter(el => typeof el == 'object');
}

defineVarNameChar = ![\r\n\t:] char:. { return char; }
defineVarName = chars:defineVarNameChar+ { return chars.join(''); }
textLiteralChar = ![\r\n\t"] char:. { return char; }
textLiteral = ["] chars:textLiteralChar* ["] { return chars.join(''); }
numberLiteral = first:[1-9] seconds:[0-9]* { return first + seconds.join(''); }
refLiteralChar = ![\r\n\t;] char:. { return char; }
refLiteral = chars:refLiteralChar+ { return chars.join(''); }

defineTextVar = "var" delimit+ name:defineVarName delimit* [:] delimit* "Text" delimit* "=" delimit* value:textLiteral ";" {
	return {
		type: 'text',
		name: name,
		value: value
	};
}

defineNumberVar = "var" delimit+ name:defineVarName delimit* [:] delimit* "Number" delimit* "=" delimit* value:numberLiteral ";" {
	return {
		type: 'number',
		name: name,
		value: value
	};
}

defineRefVar = "var" delimit+ name:defineVarName delimit* [:] delimit* "Ref" delimit* "=" delimit* value:refLiteral ";" {
	return {
		type: 'ref',
		name: name,
		value: value
	};
}
