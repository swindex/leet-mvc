import { NavController } from "./NavController";

//This stub is required to fool VSCode that implement method returns the template, while in actuality it teturns the Injector
declare namespace InjectorModule{
	const Injector = {
		Nav: new NavController,
		/**
		 * Return Injector 
		 */
		implement<T>(template: T): T;
	};
	
}

export = InjectorModule;

