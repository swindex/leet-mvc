/**
 * Typings file for the DataShape module
 */
declare namespace DataShapeModule{
	const DataShape = {
		/** To be used as a placeholder for a dynamic key name. */
		ANY_KEY: Symbol(), 
		integer (def?: null|number): number;, 
		float (def?: null|number): number;, 
		boolean (def?: nul|boolean): boolean;, 
		string (def?: null|string): string;, 
		date (def?: null|Date): Date;, 
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
		 * @param throwIfNotMatching - Trow error if the shape of the object does not match the shape of the template
		 * @return {T}
		 */
		copy<T>(obj: A, templateObj?: T, throwIfNotMatching?: boolean ): T;,
	}
}
export = DataShapeModule;