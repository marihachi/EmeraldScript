start = text
text = token:("hello" / "hi") {
	return { type: "text", content: token };
}
