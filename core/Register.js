import { BaseComponent } from "leet-mvc/components/BaseComponent";

/**
 * Register a component name or get registered component by name
 * @param {*} constructorOrName 
 * @param {string} name 
 */
window['LEET_REGISTER'] = {};
window['Registered'] = Registered;

/**
 * Register componenet to be used anywhere
 * @param {any} componenetClass 
 * @param {string} tagName 
 */
export function RegisterComponent(componenetClass, tagName){
	if (!tagName) {
		throw new Error(`Component name must not be empty`);
	}
	window['LEET_REGISTER'][tagName] = componenetClass;
	return componenetClass;
}
/**
 * Get registered component by name
 * @param {string} name 
 */
export function Registered(name){
	if (!name) {
		throw new Error(`component name must not be empty`);
	}
	return window['LEET_REGISTER'][name];
}