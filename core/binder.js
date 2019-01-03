import { empty, tryCall } from "./helpers";
import { BaseComponent } from "../components/BaseComponent";
import { isObject, isString } from "util";

import * as $ from 'jquery';
import { isSkipUpdate, hashObject } from "./Watcher";
import { DateTime } from "./DateTime";
import { isArray } from "util";
import { Objects } from "leet-mvc/core/Objects";
import { isFunction } from "util";


var getterCashe = {};

/** 
 * @constructor 
 * @param {*} context
 * @param {JQuery<HTMLElement>|HTMLElement|Node} container
 */
export var Binder = function(context, container){
	/** @type {Binder} */
	var self = this;
	this.context = context || this;
	/** @type {KeyValuePair} */
	this.injectVars = {};
	/**@type {HTMLElement} */
	this.container
	if (container instanceof jQuery)
		this.container = container[0];
	else
		this.container = (container || this.container) || document;

	this.eventCallbacks = {change:null, focus:null, input:null,click:null};
	/** @type {{pattern: RegExp|string, object: {}}} */
	this._capturePropOfUndefined = null;

	//bindings array contains only elements with bound attributes
	/**@type {Element[]} */
	this.bindings=[];
	
	function insertBefore(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	function insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
	
	function removeElement(elem){
		$(elem).remove();
		//if (elem.parentElement)
		//	elem.parentElement.removeChild(elem);
	}

	function replaceElement(newNode, oldNode){
		insertBefore(newNode, oldNode);
		removeElement(oldNode);
	}

	this.setContainer = function(container){
		this.container = container;
		return self;
	}

	this.setContext = function(context){
		this.context = context;
		return self;
	}
	/**
	 * Inject Variables into the scope of the binder
	 * @param {{[varName:string]:any}} vars 
	 */
	this.setInjectVars = function(vars){
		self.injectVars = vars;
		return self;
	}
	/**
	 * Inject Variables into the scope of the binder
	 * 	@param {Element[]} bindings
	 */
	this.setBindings = function(bindings){
		self.bindings = bindings;
		return self;
	}

	/**
	 * Bind DOM elements that have "bind" attribute with model
	 * @eventCallbacks Object, common event handler , {change:function(event){}, focus:function(event){}}
	 */
	this.bindElements = function (eventCallbacks){
		//if callbacks is a function then it is change by default
		if (typeof eventCallbacks === "function")
			self.eventCallbacks.change = eventCallbacks;
		else if (typeof eventCallbacks === "object")
			self.eventCallbacks = $.extend(self.eventCallbacks,eventCallbacks);

		if ( self.bindings && self.bindings.length>0)	
			throw new Error("Already bound!. bindElements can only be called ONCE!")
		
		//bindElement(self.container);
		if (!self.context.injectVars){
			context.injectVars = {};
		}
		self.source = parseElement(self.container);
		//console.log(self.source);
		var vdom = executeSource(self.source, self.injectVars);
		var newContainer = vdom.fragment || vdom.elem;
		self.vdom = vdom; 
		
		
		$(self.container).empty();
		$(self.container).append(newContainer.childNodes);
		
		//self.updateElements();

		return self;
	}

	/**
	 * 
	 * @param {*} thingToEval 
	 */
	function evalInContext(thingToEval) {
		try{
			return eval(thingToEval);
		}catch(ex){
			console.log("Error evaluating: "+ thingToEval);
			throw ex;
		}      
	}

	
	this.source = "";
	/**
	 * Bind element's events to context
	 * @param {HTMLElement|Element} elem
	 * @return {string}
	 */
	function parseElement(elem){
		var wrapIf = "";
		var wrapForEach = "";
		var thisSorurce = "";
		var wrapDirective = "";
		if (elem.nodeName=='#text'){
			var escaped = elem.textContent.replace(/\n/g,'\\n');
			thisSorurce = `createElement(null,{},"${escaped}")`;
		}else if (elem.nodeName=='#comment'){
			//var escaped = elem.textContent.replace(/\n/g,'\\n');
			thisSorurce = null;
		}else{	
			thisSorurce = "createElement(";
			var tag= elem.tagName
			var attrText = "{";
			if (elem.attributes){
				Array.prototype.slice.call(elem.attributes).forEach(function(attr) {
					switch (attr.name){
						case '[foreach]':
							wrapForEach = `"${attr.name}":"${attr.value}"`
							break;	
						case '[directive]':
							wrapDirective = `"${attr.name}":"${attr.value}"`
							break;	
						case '[if]':
							wrapDirective = `"${attr.name}":"${attr.value}"`
							break;			
						default:
							attrText += `"${attr.name}":"${attr.value}",`	
					}
					
				});
			}
			attrText +="}"
			thisSorurce += "'"+tag +"',"+ attrText;	
			thisSorurce += ",[";
			if (elem.childNodes && elem.childNodes.length>0){
				Array.prototype.slice.call(elem.childNodes).forEach(function(child) {
					thisSorurce += parseElement(child);
					thisSorurce += ",";
				});
			}
			thisSorurce += "], inject)";

			if (!empty(wrapForEach)){
				thisSorurce = "createForEachElement('"+tag+"',{"+wrapForEach+"}, function(inject){ return [ " + thisSorurce + "]},inject)";
			}
			if (!empty(wrapDirective)){
				thisSorurce = "createDirectiveElement('"+tag+"',{"+wrapDirective+"}, function(inject){ return [ " + thisSorurce + "]},inject)";
			}	
		}
		
		return thisSorurce; 
	}
	this.vdom = null;
	/**
	 * @return {vDom}
	 */
	function executeSource(parsedSource, inj){
		
		//var vdom = [];
		var scope = {
			createDirectiveElement: function(tag, attributes, createElements, inject){
				var frag = document.createDocumentFragment();
				var elem = document.createComment('DirectiveElement');
				frag.appendChild(elem);
				var attrKeys = Object.keys(attributes);
				var getters = {};
				var setters = {};
				var renderImmediately = [];
				for (var i in attrKeys){
					var bindExpression = null;
					var getter = null;
					var setter = null;
					var key = attrKeys[i]
					bindExpression = attributes[key];	
										
					switch (key){
						case '[if]':
							renderImmediately.push(key);
						case '[directive]':
							if (bindExpression){
								getter = createGetter(bindExpression,inject);
								renderImmediately.push(key);
							}
							break;
					}
					if (getter){
						getters[key] = getter; 
					}
					if (setter){
						setters[key] = setter; 
					}
				}
				var itemBuilder = function(inject){
					var ii = createElements(inject);
					return ii;
				};
				var vdom ={ values:{}, getters: getters, setters:setters, fragment:frag, elem:elem, items:[], itemBuilder:itemBuilder};
				for (var ii =0; ii < renderImmediately.length; ii++){
					directives[renderImmediately[ii]](vdom ,inject);
				}
				return vdom;	
			},
			createForEachElement: function(tag, attributes, createElements, inject){
				var frag = document.createDocumentFragment();
				var elem = document.createComment(attributes['[foreach]']);
				frag.appendChild(elem);
				
				var getters = {};
				var setters = {};

				getters['[foreach]'] = getForeachAttrParts(attributes['[foreach]']);
				var itemBuilder = function(inject){
					var ii = createElements(inject);
					return ii;
				};
				var vdom ={ values:{}, getters: getters, setters:setters,fragment:frag, elem:elem, items:[], itemBuilder:itemBuilder};
				
				//render
				directives['[foreach]'](vdom,inject);
				 
				return vdom;	
			},
			/**
			 * Create element
			 * @param {string} tag
			 * @param {string[]} attributes
			 * @param {string|vDom[]} createElements
			 * @param {any} inject
			 */
			createElement: function(tag, attributes, createElements, inject){
				var vdomItems = [];
				if (isString(createElements) && tag == null){
					return {vdom:null, elem: document.createTextNode(createElements)};
				}else
				var elem = document.createElement(tag);
				var attrKeys = Object.keys(attributes);
				var getters = {};
				var setters = {};
				var renderImmediately = [];
				for (var i in attrKeys){
					var bindExpression = null;
					var value = null;
					var getter = null;
					var setter = null;
					var key = attrKeys[i]
					bindExpression = attributes[key];	
					
					switch (key){
						//case '[if]':
						case '[class]':
						case '[attribute]':
						case '[style]':
						case '[display]':
						case '[show]':
						case '[selected]':
						//case '[directive]':
						case '[innerhtml]':
							if (bindExpression){
								getter = createGetter(bindExpression,inject);
								renderImmediately.push(key);
							}
							break;
						//case '[foreach]':
						//	renderImmediately.push(key);
						//	break;	
						case 'bind':
							if (bindExpression){
								getter = createGetter(bindExpression,inject);

								for (var k in self.eventCallbacks){
									if (empty(self.eventCallbacks[k]) || k=='change')
										continue;
									(function(k){
										elem.addEventListener(k, function (event) {
											updateBoundContextProperty(event.target, event.type == "input"); //skip formatting for input event
											if ( self.eventCallbacks[k] && tryCall(self.context,self.eventCallbacks[k], event) && event.target['parentNode'])
												repaint(event.target['parentNode']);
										});
									})(k);
								}
								
								if (isElementSetting(elem)){
									setter = createSetter(bindExpression,inject);

									(function(k){
										elem.addEventListener(k, function (event) {
											updateBoundContextProperty(event.target);
											if ( self.eventCallbacks[k] && tryCall(self.context,self.eventCallbacks[k], event) && event.target['parentNode'])
												repaint(event.target['parentNode']);
										});
									})('change');
									if (isElementSettingOnInput(elem))
										(function(k){
											elem.addEventListener(k, function (event) {
												updateBoundContextProperty(event.target, true); //skip formatting for input event
												if ( self.eventCallbacks[k] && tryCall(self.context,self.eventCallbacks[k], event) && event.target['parentNode'])
													repaint(event.target['parentNode']);
											});
										})('input');
								}
								renderImmediately.push(key);
							}
					
							break;
						default:
							elem.setAttribute(key,attributes[key]);
					}

					if (getter){
						getters[key] = getter; 
					}
					if (setter){
						setters[key] = setter; 
					}
				}
				
				for (var ii =0; ii < createElements.length; ii++){
					if (isObject(createElements[ii])){
						if (isArray(createElements[ii])){
							if (createElements[ii].length > 0 )
								createElements[ii].map(function(el){
									if (el.vdom)
										vdomItems.push(el.vdom);	
									elem.appendChild(el.fragment || el.elem);
								});
						}else{
							if (createElements[ii])
								vdomItems.push(createElements[ii]);	
							elem.appendChild(createElements[ii].fragment || createElements[ii].elem);
						}
					}else if (isFunction(createElements[ii])){
						throw new Error("Item must be an vDom object")
					}
				}

				var vdom ={ values:{},valuesD:{}, getters: getters, setters:setters, fragment:null, elem:elem, items:vdomItems, itemBuilder:null};
				elem['VDOM'] = vdom;
				
				for (var ii =0; ii < renderImmediately.length; ii++){
					directives[renderImmediately[ii]](vdom,inject);
				}

				bindEventsToContext(elem,inject);
				return vdom;	
			}
		}

		var exec = new Function('createElement','createForEachElement','createDirectiveElement','context','inject',
	`return (function(createElement,context,inject){
		return ${parsedSource}
	}).call(context,createElement,context, inject);`);
		var ret =exec(scope.createElement,scope.createForEachElement,scope.createDirectiveElement, self.context, inj);
		//console.log(ret);
		
		return ret;
	}

	/**
	 * 
	 * @param {vDom} on 
	 */
	function vDomCreateItems(on, inj){
		var f = document.createDocumentFragment()
		var ret = on.itemBuilder(inj);
		ret.map(function(vdom){
			f.appendChild(vdom.elem);
			on.items.push(vdom);
		}); 
		insertAfter(f,on.elem);
	}

	/**
	 * Bind element's events to context
	 * @param {HTMLElement|Element} elem
	 */
	function bindEventsToContext(elem,inject){
		Array.prototype.slice.call(elem.attributes).forEach(function(attr) {
			if (typeof elem[attr.name] == 'function'){
				//var inject = self.injectVars;
				elem[attr.name] = (function(evt){
					updateBoundContextProperty(evt.target);
					var inj = $.extend({}, self.injectVars,{'$event':evt},inject, findElemInject(elem));
					var c = createCaller(attr.value, inj);
					c(self,inj);
				}).bind(self);
			}	
		});
	}
	/**
	 * Find closest element with INJECT
	 * @param {HTMLElement|Element|Node} elem
	 */
	
	function findElemInject(elem){
		if (elem['INJECT']){
			return elem['INJECT'];
		}
		if (elem.parentNode){
			return findElemInject(elem.parentNode);
		}
		return null;
	}
	
	/**
	 * Update DOM elements according to bindings
	 */
	this.updateElements = function(){
		//console.log("update started");
		checkVDomNode(self.vdom, self.injectVars); 
		//console.log("update ended");
		return self;
	} 

	/** 
	 * @param {vDom} on  
	 */
	function checkVDomNode(on, inject){
		//console.log(on);
		if (on && on.getters){
			for (var key in on.getters){
				if (!on.getters.hasOwnProperty(key))
					continue;
										
				if (directives[key] && directives[key](on, inject)===false){
					//if directives[key](on, inject) returns false, means return right away
					return false;
				}
			};
		
			for( var i in  on.items){
				if (!on.items.hasOwnProperty(i))
					continue;
				checkVDomNode(on.items[i], inject);
			};
		}else if (!on){
			console.log("AAAA");
		}
	}

	var directives = {
		'bind':function(on, inject){
			var key = "bind";
			var getter = on.getters[key];
			try{
				var newValue = getter(self, inject);  
			}catch(ex){
				var newValue = undefined;
			}	
			if (on.values[key] !== newValue){
				on.values[key] = newValue;
				updateBoundElement(on.elem, newValue);
			}
		},
		'[selected]':function(on, inject){
			var key = "[selected]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (newValue){
				on.elem.setAttribute('selected',"");
			}else
				on.elem.removeAttribute('selected');
		},
		'[style]':function(on, inject){
			var key = "[style]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (typeof newValue =='object'){
				$.each(newValue,function(i,prop){
					if (prop!==null)
						on.elem.style[i] = prop;
					else
						on.elem.style[i] = 'auto';
				})
			}
		},
		'[attribute]':function(on, inject){
			var key = "[attribute]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (typeof newValue =='object'){
				$.each(newValue,function(i,prop){
					if (prop!==null)
						on.elem.setAttribute(i,prop);
					else
						on.elem.removeAttribute(i);	
				})
			}
		},
		'[display]':function(on, inject){
			var key = "[display]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (on.values[key] !== newValue){
				on.values[key] = newValue;
				//on.elem.className = newValue;
				if (!on.valuesD.hasOwnProperty(key)){
					on.valuesD[key] = on.elem.style.display;
				}

				on.elem.style.display = newValue;
									
			}
		},
		'[show]':function(on, inject){
			var key = "[show]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (on.values[key] !== newValue){
				on.values[key] = newValue;
				//on.elem.className = newValue;
				if (!on.valuesD.hasOwnProperty(key)){
					on.valuesD[key] = on.elem.style.display;
				}

				if (newValue){
					on.elem.style.display = on.valuesD[key];
				}else{
					on.elem.style.display = 'none';
				}					
			}
		},
		'[class]':function(on, inject){
			var key = "[class]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (on.values[key] !== newValue){
				on.values[key] = newValue;
				//on.elem.className = newValue;
				if (!on.valuesD.hasOwnProperty(key)){
					on.valuesD[key] = on.elem.className;
				}

				if (!empty(newValue) && on.elem.className.indexOf(newValue) < 0)
					on.elem.className += " "+ newValue;
				else if (empty(newValue))
					on.elem.className = on.valuesD[key]
			}
		},
		'[innerhtml]':function(on, inject){
			var key = "[innerhtml]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (on.values[key] !== newValue){
				on.values[key] = newValue;
				on.elem.innerHTML = newValue;
			}
		},
		'[if]':function(on, inject){
			var key = "[if]";
			var getter = on.getters[key];
			var isTrue;
			try{
				isTrue = getter(self,inject);
			}catch(ex){
				isTrue = false;
			}
			if (on.values[key] !== isTrue){
				on.values[key] = isTrue;
				if (isTrue){
					if ( on.items.length ==0){
						//if if directive does not have any children, create them
						vDomCreateItems(on,inject)
					}else{
						insertAfter(on.items[0].elem, on.elem);
					}

				}else{
					if ( on.items.length > 0 && on.items[0].elem.parentElement){
						removeElement(on.items[0].elem);
					}
					return false;
				}
				
			}
		},
		'[foreach]':function(on, inject){
			var key = "[foreach]";
			var getter = on.getters[key];
			/** @type {{data:string,index:string,item:string}}*/
			var parts = getter;
			var data = createGetter(parts.data,inject)(self, inject) || [];
			
			var f = document.createDocumentFragment();

			var touchedKeys = {};
			var keys = Object.keys(data);

			//if ( on.values[key] != hashObject(data)){
			//	on.values[key] = hashObject(data);

				//remove all items temporarely
				for (var index in on.items){
					if (!on.items.hasOwnProperty(index))
						continue;	
					f.appendChild(on.items[index].elem);
				}
				removeElement(f);

				//create a new fragment for new/updated items
				f = document.createDocumentFragment();
				for (var index in data){
					if (!data.hasOwnProperty(index))
						continue;		
					var item = data[index];	
					touchedKeys[index]=null;
					var inj = {}
					inj[parts.index] = index;
					inj[parts.item] = item;
					inj = $.extend({},inject,inj);
					if (!on.items.hasOwnProperty(index)){
						var ret = on.itemBuilder(inj);
						on.items[index] = ret[0];
					}else{
						checkVDomNode(on.items[index], inj);
					}
					on.items[index].elem['INJECT'] = inj;
					f.appendChild(on.items[index].fragment || on.items[index].elem); 
					
				};
				//delete vdom.items thet were not in the data object
				for (var index in on.items){
					if (!on.items.hasOwnProperty(index))
						continue;	
					if (touchedKeys.hasOwnProperty(index))
						continue;
					//removeElement(on.items[index].elem);
					delete on.items[index];
				}

				if (on.elem.parentNode)
					insertAfter(f, on.elem);
				else
					console.warn("[ForEach]: element does not have a parent!",on.elem)
			/*}else{
				//only check items
				for (var index in data){
					if (!data.hasOwnProperty(index))
						continue;		
					var item = data[index];	
					var inj = {}
					inj[parts.index] = index;
					inj[parts.item] = item;
					inj = $.extend({},inject,inj);
					checkVDomNode(on.items[index], inj);
				}
			
			}*/
			return false;
		},
		'[directive]':function(on, inject){
			var key = "[directive]";
			var getter = on.getters[key];
			var result = getter(self,inject);
			var html = null;
			var component;
			var callbacks=null; 
			if (result instanceof BaseComponent){
				component = result;
				html = result.html;

				if (isObject(result.events))
					callbacks = result.events;
				else
					callbacks = self.eventCallbacks;
				
			}else{ 
				html=result;
				callbacks = self.eventCallbacks;
			}
			if (on.values[key] !== result){
				on.values[key] = result;
				if (component){
					tryCall(component,component.onInit, on.elem);
				}
				
				var inj = $.extend({},{component:component},inject);

				var f = document.createDocumentFragment()

				//remove existing element, if it is already there
				if (on.items[0])
					$(on.items[0].elem).remove();
				on.items = [];

				//build directive conttnents
				var ret = on.itemBuilder(inj);
				ret.map(function(vdom){
					f.appendChild(vdom.elem);
					vdom.elem['INJECT'] = inj;

					on.items.push(vdom);
				});
				 
				//if html is supplied, overwrite the first childs contents
				if (on.items.length==1 && html){
					var ff = document.createElement('div');
					ff.innerHTML = html;
					var parsed = parseElement(ff);
					var vdom = executeSource(parsed, inj);
					
					$(on.items[0].elem).append(vdom.elem.childNodes)
					on.items[0].items = vdom.items;
				}
				insertAfter(f,on.elem);

				for( var i in  on.items){
					if (!on.items.hasOwnProperty(i))
						continue;
					checkVDomNode(on.items[i], inj);
				};
				
				if (component){
					component.binder = self;
					tryCall(component,component.init, on.items[0].elem);
				}
			}else if (isObject(on.values[key])){
				var inj = $.extend({},{component:on.values[key]},inject);
				for( var i in  on.items){
					if (!on.items.hasOwnProperty(i))
						continue;
					checkVDomNode(on.items[i], inj);
				};
			}else if (isString(on.values[key])){
				for( var i in  on.items){
					if (!on.items.hasOwnProperty(i))
						continue;
					checkVDomNode(on.items[i], inj);
				};
			}
			
			return false;
		}
	}

	function createExecuteElemAttrGetter(elem,attrName,attrValue ){
	
		try{
			var inj = findElemInject(elem);
			if (empty(elem.VNODE.getters[attrName]))
				elem.VNODE.getters[attrName] = createGetter(attrValue, inj);
			var result = elem.VNODE.getters[attrName](self, inj);
		}catch(ex){
			var result = null;
		}
		return result;
	}
	function updateBoundElement(elem, v){
		var format = elem.getAttribute('format');
		if (format !== null) {
			var formats = format.split(":");
			if (formats.length > 0 && formats[0] === "number") {
				if (v!==""){	
					v = v * 1;
					if (isNaN(v)) v = 0;
					if (formats.length == 2){
						var ln = !isNaN(formats[1]) ? formats[1] : createExecuteElemAttrGetter(elem,'format',formats[1]);

						v = round(v, parseInt(ln));
					}
				}	
			}
			if (formats.length > 0 && formats[0] === "boolean") {
				if (formats.length === 2) {
					var titles = formats[1].split(",");
					v = titles[(v === true ? 0 : 1 )];
					if (v === undefined)
						throw Error("Value of bind is not part of format's boolean options");
				}
			}
			if (formats.length > 0 && formats[0] === "dateTime") {
				v = DateTime.toHumanDateTime(v);
			}
			if (formats.length > 0 && formats[0] === "date") {
				v = DateTime.toHumanDate(v);
			}
		}
		switch (elem.tagName) {
			case "SELECT":
				$(elem).find("option").removeAttr('selected');
				window.requestAnimationFrame(()=>{
					if (v===null || v === undefined)
						$(elem).find("option").first().attr('selected',"");
					else{
						var sel = $(elem).find("option[value='"+ v +"']").first();
						if (sel.length){
							sel.attr('selected',"");
							elem.value = v; //this is important
						}else{
							//select we are trying to set does not have that option!
							$(elem).find("option[value='']").first().attr('selected',"");
							//opdate data property to keep it in sync with element; 
							updateBoundContextProperty(elem);
						}
					}
				});
				break;
			case "OPTION":
			case "INPUT":
				switch (elem.type) {
					case "radio":
						elem.checked = (v == elem.value);
						break;
					case "checkbox":
						elem.checked = v;
						break;
					default:
						elem.value = toInputValue(v);
						break;
				}
				break;
			case "IMG":
				if (elem.src !== v)
					elem.src = toInputValue(v);
				break;
			default:
				if (elem.innerText !== v )
					elem.innerText = toInputValue(v);
				break;	
		}
	}
	function toInputValue(val){
		if (typeof val == 'undefined' || val === null)
			return "";
		return val;	
	}
	function isElementSetting(elem){
		switch (elem.tagName) {
			case "SELECT":
			case "OPTION":
			case "TEXTAREA":
			case "INPUT":
				return true;
			default:
				return false;
		}
	}
	function isElementSettingOnInput(elem){
		switch (elem.tagName+":"+elem.type) {
			case "INPUT:text":
			case "INPUT:password":
			case "INPUT:email":
			case "INPUT:number":
			case "INPUT:search":
			case "INPUT:week":
			case "INPUT:url":
			case "INPUT:time":
			case "INPUT:tel":
			case "INPUT:range":
			case "INPUT:month":
			case "INPUT:datetime":
			case "INPUT:date":
			case "INPUT:color":
			case "TEXTAREA":

				return true;
			default:
				return false;
		}
	}
	function updateBoundContextProperty(elem, skipUpdate ){
		function formatValue(value, format){
			var v;
			if(format != null ){
				var formats = format.split(":");
				if (formats.length > 0 && formats[0] === "number") {
					if (value==="" )
						v = null;
					else
					{
						v = value * 1;
						if (isNaN(v)) v = 0;
						if (formats.length == 2){
							var ln = !isNaN(formats[1]) ? formats[1] : createExecuteElemAttrGetter(elem,'format',formats[1]);

							v = round(v, parseInt(ln));
						}
					}
				}
				if (formats.length > 0 && formats[0] === "boolean") {
					if (formats.length === 2) {
						var titles = formats[1].split(",");
						if (titles.length >= 1)
							v = value === titles[0];
						else
							v = parseInt(value) != 0;
					}else {
						v = parseInt(value) != 0;
					}
				}
				if (formats.length > 0 && formats[0] === "dateTime") {
					if (formats.length == 1) {
						v = DateTime.fromHumanDateTime(value);
					}
				}
				if (formats.length > 0 && formats[0] == "date") {
					if (formats.length == 1) {
						v = DateTime.fromHumanDate(value);
					}
				}
			}else{
				v = value;
			}
			return v;
		}
	
		if (!isElementSetting(elem) || empty(elem['VDOM'].setters.bind))
			return;
		//var bind = elem.getAttribute('bind');
		//if (empty(bind))
		//	return;

		var v;

		var format = elem.getAttribute('format');
		var type = elem.getAttribute('type');

		switch (elem.tagName) {
			case "SELECT":
				var sel = $(elem).find("option:selected");
				v = formatValue(sel[0].getAttribute('value'),format);
				console.log(v);
				break;
			case "OPTION":
			case "INPUT":
				switch (type) {
					case 'checkbox':
						v= elem.checked;
						break;
					default:
						v = formatValue(elem.value,format);
						break;	
				}
				break;
			default:
				v = elem.value;
		}
		//SetObjProp(this.context,bind,v);
		var inj = $.extend({}, self.injectVars, findElemInject(elem));

		var oldval = elem['VDOM'].getters.bind(self, inj);
		if ( oldval !== v){
			
			if (skipUpdate && self.context[isSkipUpdate] === false){
				self.context[isSkipUpdate] = true;
				elem['VDOM'].setters.bind(self, inj, v);
				self.context[isSkipUpdate] = false;
			}else{
				elem['VDOM'].setters.bind(self, inj, v);
			}
		}
	}

	this.addListener= function(eventName, callback){
		this.events[eventName] = callback;
	}

	this.capturePropOfUndefinedInto = function(pattern,object){
		self._capturePropOfUndefined = {pattern: pattern, object: object};
	}

	//local helper functions
	function GetObjProp(obj,property){
		try{
			return evalInContext.call(obj,property);
		}catch(ex){
			console.log("Unable to set " + property);
		}
		return null;
	}
	function getForeachAttrParts(attrValue){
		if (empty(attrValue))
			return null;
		/** @type {string[]}*/	
		var parts = attrValue.split(/ (in|as|where) /g);
		var p = {
			data: null,
			index:'index',
			item:'item',
			where:null
		};
		var p_name = 'data';
		parts.forEach((part)=>{
			switch (part){
				case 'in':
					p.index = p.data; //first item must have been index
					p_name = 'data';	//set data next
					break;
				case 'as':
					p_name = 'item';	//set item next
					break;
				case 'where':
					p_name= 'where'		//set where next
					break;
				default:
				p[p_name] = part;
			}
		})
		return p;
	}
	/**
	 * 
	 * @param {string} expression 
	 * @return {function(*,*)} callback
	 */
	function createGetter(expression, inject){
		var inj = createInjectVarText(inject);
		try{
			var cashe = inj+expression;
			if ( getterCashe.hasOwnProperty(cashe))
				return getterCashe[cashe];
			var getter = eval.call(this, 
						`(function (context,inject){
							${inj}
							return (function(){
								return ${expression};
							}).call(context.context);
						})`
 			);       
			getterCashe[cashe] = getter;
			return getter;
		}catch(ex){
			return null;
		}		
	}
	/**
	 * 
	 * @param {string} expression 
	 * @param {object} inject
	 * @return {function(*,*)} callback
	 */
	function createCaller(expression, inject){
		var inj = createInjectVarText(inject);
		try{
			var cashe = inj+expression;
			if ( getterCashe.hasOwnProperty(cashe))
				return getterCashe[cashe];
			var getter = eval( 
						`(function (context,inject){
							${inj}
							(function(){
								${expression};
							}).apply(context.context)
						})`
			 );
			getterCashe[cashe] = getter;
			return getter;
		}catch(ex){
			return null;
		}		
	}

	/**
	 * 
	 * @param {string} expression 
	 * @param {object} inject
	 * @return {function(*,*,*)} callback
	 */	
	function createSetter(expression, inject){
		var inj =  createInjectVarText(inject);
		
		try{
			return eval.call(self.context, `(function (context,inject, value){
				${inj}
				return (function(value){
					return ${expression} = value;
				}).call(context.context, value);
			})`)
		}catch(ex){
			return null;
		}
	}

	function createInjectVarText(vars){
		var inj = "";
		if (!empty(vars)){
			for(var i in vars){
				if (!vars.hasOwnProperty(i)) continue;
				inj +="var " + i + "= inject['"+i+"'];\n";
			}
		}
		return inj;
	}

	function repaint(element){
		// in plain js
		var old = element.style.display;
		element.style.display = 'none';
		element.style.display = old;
	}
	function round(num, decimals) {
		decimals = decimals || 0;
	    var scale = Math.pow(10, decimals);
		return Math.round(num * scale)/scale;
	}
}