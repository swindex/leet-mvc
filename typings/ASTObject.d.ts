interface ASTObject {
	data: string,
	type: "tag"|"text",
	name: "div"|"ul"|"li"|"span",
	attribs: {
		[key:string]:string
	},
	children: ASTObject[]
}