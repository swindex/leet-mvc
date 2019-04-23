import { NavController } from "./NavController";

//poor man's dependency injection
//
/**
 * Import this into the index.js and inject your objects into it
 * var Inject = Injector.implement(InjectTemplate)
	Inject.Config = Config ;
 */
export const Injector = {
	implement: (InjectTemplate )=>{return Injector}
}

