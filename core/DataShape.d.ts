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
		 * @param throwIfNotMatching - false - no error reporting (default); true - Throw errors; 1 - Throw warnings
		 * @return {T}
		 */
		copy<T>(obj: A, templateObj?: T, throwIfNotMatching?: boolean ): T;,
	}
}
export = DataShapeModule;