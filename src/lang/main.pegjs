start = defineMetaPart defineVarPart

breakLine = [\r\n]
space = [ \t]
splitter = breakLine / space

defineMetaPart = items:(defineMetaName / defineMetaTitle / splitter)* {
	return items.filter(el => el != '\r' && el != '\n' && el != '\t');
}

defineMetaName = "#name" splitter+ nameChars:(!([\t\r\n]) .)+ breakLine {
	return { type: 'metaName', value: nameChars.map(el => el[1]).join('') };
}

defineMetaTitle = "#title" splitter+ titleChars:(!([\t\r\n]) .)+ breakLine {
	return { type: 'metaTitle', value: titleChars.map(el => el[1]).join('') };
}

defineVarPart = items:(defineTextVar / splitter)* {
	return items.filter(el => el != '\r' && el != '\n' && el != '\t');
}

defineTextVar = "var" splitter+ varNameChars:(![\n\t:] .)+ splitter* [:] splitter* "Text" splitter* "=" splitter* "\"\";" {
	return { type: 'textVar', name: varNameChars.map(el => el[1]).join(''), value: '' };
}
