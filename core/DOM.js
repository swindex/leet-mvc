

/**
 * jQuery replacement
 * @param {HTMLElement|DocumentFragment|Element|string} elem 
 */
export function DOM(elem){
	const self = {
		/**
		 * Remove element and their children from DOM
		 * @param {function(HTMLElement|Element): void} [onRemoveElement] 
		 */
		remove(onRemoveElement){
			//remove children
			for (let k in elem.children){
				if (!elem.children.hasOwnProperty(k)) continue;
				DOM(elem.children[k]).remove(onRemoveElement);
			}
		
			if(elem.parentNode) {
				elem.parentNode.removeChild(elem);
				DOM(elem).removeAllEventListeners();
			}
	
			if (typeof onRemoveElement== "function"){
				onRemoveElement(elem);
			}
		},
	
		/**
		 * Append children to element
		 * @param {*} children 
		 */
		append(children){
			var children = Array.prototype.slice.call(children);
			for (let k in children){
				if (!children.hasOwnProperty(k)) continue;
				elem.appendChild( children[k] );
			}
		},
	
		/**
		 * Add event listener to element
		 * @param {string} event 
		 * @param {function(Event)} handler
		 * @param {any} [capture]
		 */
		addEventListener(event, handler, capture){
			if (!elem["__EVENTS__"]){
				elem["__EVENTS__"] = {};
			}
			if(!(event in elem["__EVENTS__"])) {
				// each entry contains another entry for each event type
				elem["__EVENTS__"][event] = [];
			}
			// capture reference
			elem["__EVENTS__"][event].push([handler, capture]);
			elem.addEventListener(event, handler);
		},
	
		/**
		 * Remove Event Listener
		 * @param {string} eventName 
		 */
		removeEventListener(event){
			var eventHandlers = elem["__EVENTS__"][event];
			if ( !eventHandlers ) {
				return;
			}
	
			for( var i in eventHandlers ) {
				var handler = eventHandlers[i];
				elem.removeEventListener(event, handler[0], handler[1]);
			}
			
			delete elem["__EVENTS__"][event];
		},
	
		/**
		 * Remove All Event Listeners
		 */
		removeAllEventListeners(){
			var handlers = elem["__EVENTS__"];
			if (!handlers) {
				return;
			}
			for( var event in handlers) {
				DOM(elem).removeEventListener(event);
			}
			delete elem["__EVENTS__"];
		},
	
		/**
		 * Repaint element
		 */
		repaint(){
			// in plain js
			var old = elem.style.display;
			elem.style.display = 'none';
			elem.style.display = old;
		},
		/**
		 * Find children by query
		 * @param {string} query 
		 * @return {HTMLElement[]|HTMLOptionElement[]|Element[]}
		 */
		find(query){
			var elems = Array.from(elem.querySelectorAll( query ));
			// @ts-ignore
			return elems;
		}
	
	}

	if (elem == null){
		elem = document;
	}

	if (typeof elem == "string" || typeof elem == "number"){
		return Array.from(document.querySelectorAll( elem ));
	}

	return self;
}  