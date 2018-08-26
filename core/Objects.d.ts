declare function empty( obj:any ): boolean;

declare namespace ObjectsModule{
	const Objects = {
		/**
		 * A filter function, which can be used to seamlessly iterate over both objects and arrays.
		 * Arrays and array-like objects with a length property (such as a function's arguments object) are
		 * iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties.
		 *
		 * @param obj The object to iterate over.
		 * @param callback The function that will be executed on every object. Return true to add it to filtered array
		 * @return {T}
		 */
		filter<T, K extends keyof T>(obj: T, callback: (valueOfProperty: T[K], propertyName: any) => false | true): T;
		/**
		 * Find first element
		 * @param obj The array of objects to find element in
		 * @param callback The function that will be executed on every object. Return true to add it to filtered array
		 * @return {T}
		 */
		find<T, K extends keyof T>(obj: T, callback: (valueOfProperty: T[K], propertyName: any) => false | true): T[K];
		/**
		 * A iterator function, which can be used to seamlessly iterate over both objects and arrays.
		 * Arrays and array-like objects with a length property (such as a function's arguments object) are
		 * iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties.
		 *
		 * @param obj The object to iterate over.
		 * @param callback The function that will be executed on every object. Return false to stop iteration. Return any to skip rest of block
		 * @return {T}
		 */
		forEach<T, K extends keyof T>(obj: T, callback: (valueOfProperty: T[K], propertyName: any) => false | any): void; 

		keyBy<T, K extends keyof T>(obj: T, column: string):{[key:string]: T[K]}; 
		
		/**
		 * Set Object properties to null, preserving references and structure
		 * @param {*} obj 
		 */
		clear(obj: any):void;
		
		/**
		 * Copy Object Data
		 * @param obj The object to copy.
		 * @param templateObj The template.
		 * @return {T}
		 */
		copy<T>(obj: T): T;
		/**
		 * Copy Object Data using a template
		 * @param obj The object to copy.
		 * @param templateObj The template.
		 * @return {T}
		 */
		copy<T>(obj: A, templateObj?: T, ): T;

		/**
		 * Get object property using path
		 * @param {*} obj 
		 * @param {string[]} pathArray 
		 */
		getPropertyByPath(obj: any, pathArray: string[]|string): any;

		/**
		 * Get object property using path
		 * @param {*} obj 
		 * @param {string[]} pathArray 
		 */
		setPropertyByPath(obj: any, pathArray: string[]|string, value:any);
	}
}

export = ObjectsModule;