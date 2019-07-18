declare namespace helpersModule{
	const exp = {
		/**
		 * Overrides a function or a method.
		 * 
		 * @param originalContext - context to execute the original function
		 * @param originalFunction - method/function to override
		 * @param overrideFunction - callback to execute instead of the original function/method
		 * 	- next - original method to call
		 * 	- ...args - arguments passed to the original method
		 */
		Override<T>( originalContext: object, originalFunction: T, overrideFunction: ( next: Function, ...args )=>any ): T;
	}
}

export = helpersModule.exp;