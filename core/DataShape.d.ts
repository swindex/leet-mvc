/**
 * Typings file for the DataShape module
 */
declare namespace DataShapeModule{
	const DataShape = {
		integer (def: null|number): number;, 
		float (def: null|number): number;, 
		boolean (def: nul|boolean): boolean;, 
		string (def: null|string): string;, 
		date (def: null|Date): Date;, 
		/**
		 * Copy Object Data
		 * @param obj The object to copy.
		 * @return {T}
		 */
		copy<T>(obj: T): T;,
		/**
		 * Copy Object Data using a template
		 * @param obj The object to copy.
		 * @param templateObj The template.
		 * @return {T}
		 */
		copy<T>(obj: A, templateObj?: T, ): T;,
	}
}
export = DataShapeModule;