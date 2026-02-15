export interface FieldTemplate{
	name?:string|null;
	_name?: string|null; //internal
	title?:string|null;
	value?:any;
	type?: string|null;
	class?: string|null;
	placeholder?:string|null;
	validateRule?:string|null;
	displayRule?:string|null;
	setField?:string|null;
	items?:FieldTemplate[]|SelectOption[];
	dataType?:string|null;
	attributes?:FieldData|null;
	unit?:string|null;
	icon?:string|null;
	dynamicItems?:any;
	ownItems?:FieldTemplate[]|null; //custom items that are not processed by the validator and are passed into the created component
	info?:{title:string,text:string}|string|null;
	isLoading?: boolean|null; //mark field as waiting for dynamic data
	context?: any; //Component fields can have context property referring to the Component it self
}

export interface SelectOption {
  value: string|number|boolean,
  title: string,
  description?: string
}

export interface GenFormData{
	data:{[key:string]:any};
	attr:{[key:string]:any};
	errors:{[key:string]:any};
	hints:{[key:string]:any};
}

export interface FieldData{
	[key:string]:string|number|boolean;
}

export interface HTMLElementMouseEvent extends MouseEvent{
	target: HTMLInputElement;
}

export interface HTMLInputElementChangeEvent extends Event{
	target: HTMLInputElement;
}

export interface KeyValuePair{
	[key:string]: any
}

