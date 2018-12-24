
interface FieldTemplate{
	name:string;
	_name?: string; //internal
	title?:string;
	value?:string|number;
	type:string;
	placeholder?:string;
	validateRule?:string;
	displayRule?:string;
	setField?:string;
	items?:FieldTemplate[];
	dataType?:string;
	atttributes?:FieldData;
	unit?:string;
	icon?:string;
}

interface GenFormData{
	data:{[key:string]:any};
	attr:{[key:string]:any};
	errors:{[key:string]:any};
	hints:{[key:string]:any};
}

interface FieldData{
	[string]:string|number|boolean;
}

interface HTMLElementMouseEvent extends MouseEvent{
	target: HTMLInputElement;
}

interface HTMLInputElementChangeEvent extends Event{
	target: HTMLInputElement;
}

interface vDom {
	values:{},
	valuesD:{},
	getters: {},
	setters: {},
	elem: HTMLElement,
	items:vDom[],
	itemBuilder:function
};
