
interface FieldTemplate{
	name:string;
	_name?: string; //internal
	title?:string;
	value?:string|number;
	type:string;
	placeholder?:string;
	validateRule?:string;
	displayRule?:string;
	items?:FieldTemplate[];
	dataType?:string;
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