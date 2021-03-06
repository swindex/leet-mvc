interface Iterable<T> {
  readonly length?: number;
  readonly [n: number]: T;
}
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
    filter<T>(obj: Array<T>, callback: (valueOfProperty: T[K], propertyName: any) => false | true): Array<T>;,
		filter<T>(obj: Iterable<T>, callback: (valueOfProperty: T[K], propertyName: any) => false | true): Iterable<T>;,

		/**
		 * A map function that creates a new array from the collection of thigs returned in the callback
		 *
		 * @param  obj The object/array to iterate over.
		 * @param callback The function that will be executed on every object. Returned value is added to the new array
		 */
		map<NT, T>(obj: Iterable<T>, callback: (valueOfProperty: T, propertyName: any) => NT ): NT[];,

		/**
		 * Find first element
		 * @param obj The array of objects to find element in
		 * @param callback The function that will be executed on every object. Return true to add it to filtered array
		 * @return {T|null}
		 */
		find<T>(obj: Iterable<T>, callback: (valueOfProperty: T, propertyName: any) => false | true): T|null;,
		/**
		 * A iterator function, which can be used to seamlessly iterate over both objects and arrays.
		 * Arrays and array-like objects with a length property (such as a function's arguments object) are
		 * iterated by numeric index, from 0 to length-1. Other objects are iterated via their named properties.
		 *
		 * @param obj The object to iterate over.
		 * @param callback The function that will be executed on every object. Return false to stop iteration. Return any to skip rest of block
		 * @return {T}
		 */
		forEach<T>(obj: Iterable<T>, callback: (valueOfProperty: T, propertyName: string|number) => false | any): void;,

		/**
		 * Convert array of objects to key-value pair collection
		 * @param arr array of objects
		 * @param keyColumn name of the column to become the new key
		 */
		keyBy<T, K extends {[KeyT in keyof T]: V}>(arr: T, keyColumn: string):{[key:string]: T[K]};, 
		
		/**
		 * Convert array of objects to key-value pair collection
		 * @param arr array of objects
		 * @param keyColumn name of the column to become the new key
		 * @param valueColumn name of the column to use as the value
		 */
		keyBy<T, K extends {[KeyT in keyof T]: V}>(arr: T, keyColumn: string, valueColumn: string):{[key:string]: any};, 
		
		/**
		 * 
		 * @param arr array of objects
		 * @param keyColumn name of the column to become the new key
		 * @param valueColumns array of column names to include in to the value.
		 */
		keyBy<T, K extends {[KeyT in keyof T]: V}>(arr: T, keyColumn: string, valueColumns:string[]):{[key:string]: T[K]};, 
	
		/**
		 * Set Object properties to null, preserving references and structure
		 * @param {*} obj 
		 */
		clear(obj: any):void;,

		/**
		 * Shallow - Assign Source Object properties to Destination Object preserving Destination references while enforcing SOURCE structure
		 */
		overwrite<T>(dest: any, src: T): T;,

		/**
		 * Deep-clone Source Object
		 */
		copy<T>(src: T): T;,
		
		/**
		 * Get object property using path
		 * @param {*} obj 
		 * @param {string[]} pathArray 
		 */
		getPropertyByPath(obj: any, pathArray: string[]|string): any;,
		
		/**
		 * Get object property using path
		 * @param {*} obj 
		 * @param {string[]} pathArray 
		 */
		setPropertyByPath(obj: any, pathArray: string[]|string, value:any);,

		
		/**
		 * Delete object property using path
		 * @param {*} obj 
		 * @param {string[]} pathArray 
		 */
		deletePropertyByPath(obj: any, pathArray: string[]|string);,

		/**
		 * Get Object's callable method names
		 */
		getMethods(obj: object): string[];,

		/**
		 * Get Object's property names
		 */
		getProperties(obj:object): string[];,

		/**
		 * Bind Object's methods to it self
		 */
		bindMethods(context: object): void;,

		/**
		 * Delete all of Object's methods and properties so they can no longer be referenced
		 */
		strip(obj: object): void;,

		/**
		 * Walk object calling callback on every node
		 * @param obj - object to traverse
		 * @param callback - where first parameter is the current node and second is the key in the node
		 */
		walk<T, K extends {[KeyT in keyof T]: V}>(obj: T, callback: (node: T[K], key: K)=>any): void;,

		/**
		 * Walk 2 objects side by side calling callback on every node
		 * @param obj1 - object to traverse
		 * @param obj2 - second object that has matching keys
		 * @param callback - where first parameter is the current node, second parameter is another objects node and third one is the key in the first node
	 	 */
		walk2(obj1: object, obj2: object, callback: (node1: object, node2: object, key: string)=>any): void;,
	}
}

export = ObjectsModule;