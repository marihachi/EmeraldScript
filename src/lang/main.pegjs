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
splitter = breakLine / space

defineMetaPart = items:(defineMetaName / defineMetaTitle / splitter)* {
	return items.filter(el => typeof el == 'object');
}

defineMetaName = "#name" splitter+ nameChars:(!([\t\r\n]) .)+ breakLine {
	return { type: 'name', value: nameChars.map(el => el[1]).join('') };
}

defineMetaTitle = "#title" splitter+ titleChars:(!([\t\r\n]) .)+ breakLine {
	return { type: 'title', value: titleChars.map(el => el[1]).join('') };
}

defineVarPart = items:(defineTextVar / splitter)* {
	return items.filter(el => typeof el == 'object');
}

defineTextVar = "var" splitter+ varNameChars:(![\n\t:] .)+ splitter* [:] splitter* "Text" splitter* "=" splitter* ["] valueChars:(!["\r\n] .)* ["] ";" {
	return {
		type: 'text',
		name: varNameChars.map(el => el[1]).join(''),
		value: valueChars.map(el => el[1]).join('')
	};
}
