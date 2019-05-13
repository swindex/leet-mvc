/**
 * Register a component name or get registered component by name
 * @param {*} constructorOrName 
 * @param {string} name 
 */
window['LEET_REGISTER'] = {};
window['Registered'] = Registered;

export function Register(constructorOrName, name){
	if (arguments.length>=2){
		if (!name) {
			throw new Error(`Component name must not be empty`);
		}
		window['LEET_REGISTER'][name] = constructorOrName;
		return constructorOrName;
	}
	if (arguments.length==1){
		return window['LEET_REGISTER'][constructorOrName];
	}
	throw new Error(`Unable to register component: wrong arguments`);
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