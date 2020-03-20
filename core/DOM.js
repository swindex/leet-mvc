import { isIterable } from './helpers';
import { Objects } from './Objects';

/**
 * jQuery replacement
 * @param {Window|HTMLElement|DocumentFragment|Element|string} elemOrQuery 
 */
export function DOM(elemOrQuery){

	/**
	 * @param {object} children 
	 * @return {object[]}
	 */
	function getArray(children){
		if (isIterable(children)){
			return Array.prototype.slice.call(children);
		} else {
			return [children];
		}
	}

	/** @type {HTMLElement[]} */
	var elemArray;

	if (elemOrQuery == null){
		throw new Error("elemOrQuery can not be empty!");
	}
	
	if (typeof elemOrQuery == "string" || typeof elemOrQuery == "number"){
		elemArray = Array.from(document.querySelectorAll( elemOrQuery ))
	} else if (typeof elemOrQuery == "object" ) {
		elemArray = getArray(elemOrQuery);
	} else {
		throw new Error("Not Implemented");
	}

	const self = {
		/**
		 * Iterate ove reach element of the set
		 * @param {function(HTMLElement):void} callback 
		 */
		each(callback){
			elemArray.forEach(callback);
		},
		get(index){
			return elemArray[index];
		},
		first(){
			return elemArray[0];
		},
		attr(key, value = undefined){
			//remove children
			if (value == undefined){
				return elemArray[0].getAttribute(key);
			}
			elemArray.forEach( elem => {
				elem.setAttribute(key,value);
			})
		},
		/**
		 * Apply CSS rule to all elements
		 * @param {{[key:string]:string}|string[]|string} styles - if styles is array, return the specified css properties
		 * @param {string} [value]
		 */
		css(styles, value){
			if (empty(styles)){
				return getComputedStyle(elemArray[0]);
			}
			if (typeof styles == "string"){
				if (value === undefined)
					return getComputedStyle(elemArray[0])[styles];
				
				elemArray[0][styles] = value;
				return;
			}
			if (Array.isArray(styles)){
				var ret = {};
				var elStyles = getComputedStyle(elemArray[0]);
				styles.forEach(function(prop){
					ret[prop] = elStyles[prop] ;
				})
				return ret;
			} else {
				elemArray.forEach( elem => {
					Objects.forEach(styles,function(prop, i){
						if (prop!==null)
							elem.style[i] = prop;
						else
							elem.style[i] = 'auto';
					})
				});
			}
		},
		removeAttr(key, value){
			//remove children
			elemArray.forEach( elem => {
				elem.removeAttribute(key);
			})
		},
		/**
		 * Remove element and their children from DOM
		 * @param {function(HTMLElement|Element): void} [onRemoveElement] 
		 */
		remove(onRemoveElement){
			//remove children
			elemArray.forEach( elem => {
				if (elem.children)
					DOM(elem.children).remove(onRemoveElement);
			
				if(elem.parentNode) {
					elem.parentNode.removeChild(elem);
					DOM(elem).removeAllEventListeners();
				}
		
				if (typeof onRemoveElement== "function"){
					onRemoveElement(elem);
				}
			});
		},
	
		/**
		 * Append children to element
		 * @param {*} childOrChildren 
		 */
		append(childOrChildren){
			var chArray = getArray(childOrChildren);
			elemArray.forEach( elem => {
				for (let k in chArray){
					if (!chArray.hasOwnProperty(k)) continue;
					elem.appendChild( chArray[k] );
				}
			});
		},

		/**
		 * Insert the first element of collection After the reference element
		 * @param {HTMLElement} refChild 
		 */
		insertAfter(refChild){
			if (refChild.nextElementSibling)
				elemArray.forEach(elem=>{
					refChild.parentElement.insertBefore(elem, refChild.nextElementSibling);
				});
			else
				elemArray.forEach(elem=>{
					refChild.parentElement.append(elem);
				});
		},

		/**
		 * Insert the first element of collection Before the reference element
		 * @param {HTMLElement} refChild 
		 */
		insertBefore(refChild){
			elemArray.forEach(elem=>{
				refChild.parentElement.insertBefore(elem, refChild);
			})
		},
	
		/**
		 * Replace first element of collection with new element
		 * @param {HTMLElement} newElement 
		 */
		replaceWith(newElement){
			DOM(newElement).insertAfter(elemArray[0]);
			DOM(elemArray).remove();
		},
		/**
		 * Add event listener to element
		 * @param {string} events 
		 * @param {function(Event)} handler
		 * @param {any} [capture]
		 */
		addEventListener(events, handler, capture){
			elemArray.forEach( elem => {
				events.split(' ').forEach(event => {
					if (!elem["__EVENTS__"]){
						elem["__EVENTS__"] = {};
					}
					if(!(event in elem["__EVENTS__"])) {
						// each entry contains another entry for each event type
						elem["__EVENTS__"][event] = [];
					}
					// capture reference
					elem["__EVENTS__"][event].push([handler, capture]);
					elem.addEventListener(event.split(".")[0], handler, capture);
				})
			});
		},
		/**
		 * Remove Event Listener
		 * @param {string} events 
		 * @param {function()} [removeHandler] - specific handler to remove. By default removes all events for specified event name
		 */
		removeEventListener(events, removeHandler = null){
			elemArray.forEach( elem => {
				events.split(' ').forEach(event => {
					var eventHandlers = elem["__EVENTS__"][event];
					if ( !eventHandlers ) {
						return;
					}
			
					for( var i in eventHandlers ) {
						var handler = eventHandlers[i];
						if (removeHandler && handler[0] == removeHandler){ 
							elem.removeEventListener(event.split(".")[0], handler[0], handler[1]);
						} else if (!removeHandler){
							elem.removeEventListener(event.split(".")[0], handler[0], handler[1]);
						}
					}
					
					delete elem["__EVENTS__"][event];
				})
			})
		},
	
		/**
		 * Remove All Event Listeners
		 */
		removeAllEventListeners(){
			elemArray.forEach( elem => {
				var handlers = elem["__EVENTS__"];
				if (!handlers) {
					return;
				}
				for( var event in handlers) {
					DOM(elem).removeEventListener(event);
				}
				delete elem["__EVENTS__"];
			})
		},

		on(event, handler, capture){
			return self.addEventListener(event, handler, capture);
		},
		off(event, handler){
			return self.removeEventListener(event, handler);
		},
		
	
		/**
		 * Repaint element
		 */
		repaint(){
			// in plain js
			elemArray.forEach( elem => {
				var old = elem.style.display;
				elem.style.display = 'none';
				elem.style.display = old;
			})
		},


		/**
		 * Find a parent by query
		 * @param {string} query 
		 * //@vvreturn {HTMLElement[]|HTMLOptionElement[]|Element[]}
		 */
		closest(query){
			var elements = [elemArray[0].closest( query )];
			// @ts-ignore
			return DOM(elements);
		},
		/**
		 * Find children by query
		 * @param {string} query 
		 * //@vvreturn {HTMLElement[]|HTMLOptionElement[]|Element[]}
		 */
		find(query){
			var elems = Array.from(elemArray[0].querySelectorAll( query ));
			// @ts-ignore
			return DOM(elems);
		},
		width(){
			/** @type {HTMLElement} */
			var elem = elemArray[0];
			return elem.offsetWidth;
		},
		height(){
			/** @type {HTMLElement} */
			var elem = elemArray[0];
			return elem.offsetHeight;
		},
		scrollTop(offset = undefined){
			/** @type {HTMLElement} */
			var elem = elemArray[0];
			if (offset == undefined)
				return elem.scrollTop;

			elem.scrollTop = 0;
		},
		offsetTop() {
			// Set our distance placeholder
			var distance = 0;
			var elem = elemArray[0];
			// Loop up the DOM
			if (elem.offsetParent) {
				do {
					distance += elem.offsetTop;
					elem = elem.offsetParent;
				} while (elem);
			}
		
			// Return our distance
			return distance < 0 ? 0 : distance;
		},
		offsetLeft() {
			// Set our distance placeholder
			var distance = 0;
			var elem = elemArray[0];
			// Loop up the DOM
			if (elem.offsetParent) {
				do {
					distance += elem.offsetLeft;
					elem = elem.offsetParent;
				} while (elem);
			}
		
			// Return our distance
			return distance < 0 ? 0 : distance;
		},
		/**
		 * Scroll Element contents
		 * @param {{behavior?:'auto'|'smooth', top?: number, left?:number}} options 
		 */
		scrollTo(options){
			elemArray[0].scrollTo(options);
		}
	
	}

	return self;
}  