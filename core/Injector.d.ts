//This stub is required to fool VSCode that implement method returns the template, while in actuality it teturns the Injector
declare namespace InjectorModule{
	const Injector = {
		/**
		 * Return Injector 
		 * @param template - Injection template used for intelliSense 
		 */
		implement<T>(template: T): T;
	};
	
}

export = InjectorModule;

