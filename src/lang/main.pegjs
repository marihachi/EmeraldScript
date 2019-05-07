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
symbol = [!-/:-@[-`{-~]

//
// meta
//

defineMetaPart = items:(defineMetaName / defineMetaTitle / delimit)* {
	return items.filter(el => typeof el == 'object');
}

defineMetaName = "#name" delimit+ nameChars:(!delimit .)+ breakLine {
	return { type: 'name', value: nameChars.map(el => el[1]).join('') };
}

defineMetaTitle = "#title" delimit+ titleChars:(!delimit .)+ breakLine {
	return { type: 'title', value: titleChars.map(el => el[1]).join('') };
}

//
// variable
//

defineVarPart = items:(defineVar / delimit)* {
	return items.filter(el => typeof el == 'object');
}

typeName = type:("Text" / "Number" / "Ref")

textLiteralChar = !(delimit / ["]) char:. { return char; }
textLiteral = ["] chars:textLiteralChar* ["] {
	return {
		tokenType: 'textLiteral',
		value: chars.join('')
	};
}

numberLiteral = first:[1-9] seconds:[0-9]* {
	return {
		tokenType: 'numberLiteral',
		value: first + seconds.join('')
	};
}

identifierChar = !(delimit / symbol) char:. { return char; }
identifier = chars:identifierChar+ {
	return {
		tokenType: 'identifier',
		value: chars.join('')
	};
}

assignValue = textLiteral / numberLiteral / identifier

defineVar = "var" delimit+ name:identifier delimit* [:] delimit* type:typeName delimit* [=] delimit* valueToken:assignValue ";" {
	if (type == 'Text') {
		if (valueToken.tokenType != 'textLiteral') throw new SyntaxError('assign type error');
		return {
			type: 'text',
			name: name.value,
			value: valueToken.value
		};
	}
	else if (type == 'Number') {
		if (valueToken.tokenType != 'numberLiteral') throw new SyntaxError('assign type error');
		return {
			type: 'number',
			name: name.value,
			value: valueToken.value
		};
	}
	else if (type == 'Ref') {
		if (valueToken.tokenType != 'identifier') throw new SyntaxError('assign type error');
		return {
			type: 'ref',
			name: name.value,
			value: valueToken.value
		};
	}
}
