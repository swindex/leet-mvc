// HTML module declarations
declare module '*.html' {
  const content: string;
  export = content;
}

declare module '*.png' {
  const content: string;
  export = content;
}

declare module '*.svg' {
  const content: string;
  export = content;
}

declare module '*.scss' {
  const content: any;
  export = content;
}

// Global declarations
declare var moment: any;

interface Window {
  plugins: any;
}

interface FieldTemplate{
	name?:string;
	_name?: string; //internal
	title?:string;
	value?:any;
  type?: string;
  class?: string;
	placeholder?:string;
	validateRule?:string;
	displayRule?:string;
	setField?:string;
	items?:FieldTemplate[]|SelectOption[];
	dataType?:string;
	attributes?:FieldData;
	unit?:string;
  icon?:string;
  dynamicItems?:any;
  ownItems?:FieldTemplate[]; //custom items that are not processed by the validator and are passed into the created component
  info?:{title:string,text:string}|string;
  isLoading?: boolean; //mark field as waiting for dynamic data
  context?: any; //Component fields can have context property referring to the Component it self
}

interface SelectOption {
  value: string|number|boolean,
  title: string,
  description: string
}

interface GenFormData{
	data:{[key:string]:any};
	attr:{[key:string]:any};
	errors:{[key:string]:any};
	hints:{[key:string]:any};
}

interface FieldData{
	[key:string]:string|number|boolean;
}

interface HTMLElementMouseEvent extends MouseEvent{
	target: HTMLInputElement;
}

interface HTMLInputElementChangeEvent extends Event{
	target: HTMLInputElement;
}

interface vDom {
	values: {},
	valuesD: {},
	getters: {[key:string]:Function},
	setters: {[key:string]:Function},
	callers: {[key:string]:Function},
	plainAttrs: {},
	elem: HTMLElement|DocumentFragment,
	items:vDom[],
	itemBuilder:Function,
	inject:{},
	fragment: DocumentFragment
	events: {[key:string]:Function}
}

interface KeyValuePair{
	[key:string]: any
}