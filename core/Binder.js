import { empty, tryCall } from "./helpers";
import { BaseComponent } from "../components/BaseComponent";
import { isObject, isString } from "util";

import * as $ from 'jquery';
import { isSkipUpdate } from "./Watcher";
import { DateTime } from "./DateTime";
import { isArray } from "util";
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
	/** @type {vDom} */
	this.vdom = null;
	this.context = context || this;
	/** @type {{[key:string]:any}} */ 
	this.injectVars = {};
	/**@type {HTMLElement} */
	this.container
	if (container instanceof jQuery) {
		this.container = container[0];
	} else {
		// @ts-ignore
		this.container = container;
	}

	this.eventCallbacks = {change:null, focus:null, input:null,click:null};

	function insertBefore(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	function insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
	
	/**
	 * 
	 * @param {HTMLElement} elem 
	 * @param {boolean} [keepEvents] - default false
	 */
	function removeElement(elem, keepEvents){
		if (keepEvents === true) {
			if(elem.parentNode) {
				elem.parentNode.removeChild(elem);
			}
		} else {
			$(elem).remove();
		}
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
	 * Bind DOM elements that have "bind" attribute with model
	 * @eventCallbacks Object, common event handler , {change:function(event){}, focus:function(event){}}
	 */
	this.bindElements = function (eventCallbacks){
		//if callbacks is a function then it is change by default
		if (typeof eventCallbacks === "function")
			self.eventCallbacks.change = eventCallbacks;
		else if (typeof eventCallbacks === "object")
			self.eventCallbacks = $.extend(self.eventCallbacks,eventCallbacks);
		
		if (!self.context.injectVars){
			context.injectVars = {};
		}

		var vdom = executeSource(parseElement(self.container), self.injectVars);
		var newContainer = vdom.fragment || vdom.elem;
		self.vdom = vdom; 
		
		
		$(self.container).empty();
		// @ts-ignore
		$(self.container).append(newContainer.childNodes);
		self.vdom.elem = self.container;
		return self;
	}

	//escape attribute value
	function escapeAttribute(attrValue){
		return attrValue.replace(/\n/g,'\\n').
							replace(/"/g,'\\"');
	}
	
	/**
	 * Turn element's HTML into a createDomElement function
	 * @param {HTMLElement|Element} elem
	 * @return {string}
	 */
	function parseElement(elem){
		var thisSorurce = "";
		var wrapDirective = "";
		if (elem.nodeName=='#text'){
			var escaped = escapeAttribute(elem.textContent);
			//parse {{moustache}} template within the text node
			var bits = escaped.split(/({{[^{}]*}})/gmi);
			var splitNodes = [];
			bits.forEach(function(el){
				var ret = null;
				el.replace(/{{([^{}]+)}}|(.*)/,function(a,p1,p2,d){
					if (p1){
						splitNodes.push('createElement("#text",{bind:"'+p1+'"},[], inject)');
					}else if (p2){
						splitNodes.push('createElement("#text",{},"'+p2+'", inject)');
					}
				});
			});
			thisSorurce = splitNodes.join(',');
		} else if (elem.nodeName=='#comment') {
			//skip comments
			thisSorurce = null;
		}else{	
			thisSorurce = "createElement(";
			var tag= elem.tagName
			//var attrText = "{";
			var attributes = [];
			if (elem.attributes){
				Array.prototype.slice.call(elem.attributes).forEach(function(attr) {
					attr.value = escapeAttribute(attr.value);
					switch (attr.name){
						case '[foreach]':
						case '[transition]':
						case '[directive]':
						case '[component]':
						case '[if]':
							wrapDirective = `"${attr.name}":"${attr.value}"`;
							break;
						default:
							attributes.push('"'+attr.name +'":"'+attr.value+'"');
					}
					
				});
			}
			//attrText +="}"
			thisSorurce += "'"+tag +"',{"+ attributes.join(',')+"}";	
			thisSorurce += ",[";

			if (elem.childNodes && elem.childNodes.length>0){
				Array.prototype.slice.call(elem.childNodes).forEach(function(child) {
					thisSorurce += parseElement(child);
					thisSorurce += ",";
				});
			}
			thisSorurce += "], inject)";

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
			/** Any kind of element that creates it's own scope AND returns vDOM with fragment and itemBuilder  */
			createDirectiveElement: function(tag, attributes, createElements, inject){
				//create directive fragment element, into which the deirective contents will be appended
				var directiveFragment = document.createDocumentFragment();
				
				var attrKeys = Object.keys(attributes);
				var getters = {};

				var getter = null;
				var key = attrKeys[0];
				var bindExpression = attributes[key];

				//create comment element that will become the anchor for the directive.
				var elem = document.createComment( key+"="+bindExpression+" ");
				directiveFragment.appendChild(elem);

				if (bindExpression){
					if (key =="[foreach]") {
						//special handling for foreach. because getter can not be created from foreach attribute [foreach] = "index in this.items as item"
						getters[key] = getForeachAttrParts(attributes[key]);
					} else {
						//for all other attributes like [if] = "this.isVisible" create getter for the attribute value
						getter = createGetter(bindExpression,inject);
						if (getter){
							getters[key] = getter; 
						}
					}
				}
				//because directive children are likely to be re-rendered, do not immediately render them. create itemBuilder function
				var itemBuilder = function(inject){
					var ii = createElements(inject);
					return ii;
				};
				var vdom ={ values:{}, getters: getters, setters:{}, fragment:directiveFragment, elem:elem, items:[], itemBuilder:itemBuilder};
				executeAttribute( key , vdom , inject);
				
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
				inject = inject || {};
				var vdomItems = [];
				var elem;
				var attrKeys = Object.keys(attributes);
				var getters = {};
				var setters = {};
				var renderImmediately = [];

				if (tag == "#text"){
					if (isString(createElements)){
						elem = document.createTextNode(createElements);
						var vdom ={ values:{},valuesD:{}, getters: getters, setters:setters, fragment:null, elem:elem, items:vdomItems, itemBuilder:null};

					}else{
						elem = document.createTextNode("");
						getters = {'bind':createGetter(attributes['bind'],inject)}
						var vdom ={ values:{},valuesD:{}, getters: getters, setters:setters, fragment:null, elem:elem, items:vdomItems, itemBuilder:null};
						executeAttribute('bind', vdom,inject);
					}
									
					return vdom;
				}else{
					elem = document.createElement(tag);
				}
				for (var i in attrKeys){
					var bindExpression = null;
					var value = null;
					var getter = null;
					var setter = null;
					var key = attrKeys[i]
					bindExpression = attributes[key];	
					
					switch (key){
						case '[class]':
						case '[attribute]':
						case '[style]':
						case '[display]':
						case '[show]':
						case '[selected]':
						case '[innerhtml]':
							if (bindExpression){
								getter = createGetter(bindExpression,inject);
								renderImmediately.push(key);
							}
							break;
						case 'bind':
							if (bindExpression){
								getter = createGetter(bindExpression,inject);
								if (isElementSetting(elem)){
									setter = createSetter(bindExpression,inject);
								}
								

								applyCallbacks(elem, self.context, self.eventCallbacks);

								if (inject.component && inject.component.events){
									applyCallbacks(elem, inject.component, inject.component.events);
								}

								renderImmediately.push(key);
							}
							elem.setAttribute(key,attributes[key]);
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

				var vdom = { values:{},valuesD:{}, getters: getters, setters:setters, fragment:null, elem:elem, items:vdomItems, itemBuilder:null};
				elem['VDOM'] = vdom;
				
				for (var ii =0; ii < renderImmediately.length; ii++){
					executeAttribute(renderImmediately[ii], vdom,inject);
				}

				bindEventsToContext(elem,inject);
				return vdom;	
			}
		}

		var exec = new Function('createElement','createDirectiveElement','context','inject',
			`return (function(createElement,context,inject){return ${parsedSource}}).call(context,createElement,context, inject);`
		);
		var ret =exec(scope.createElement,scope.createDirectiveElement, self.context, inj);
		
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
				elem[attr.name] = null;
				$(elem).on(attr.name.substr(2), function(evt){
					updateBoundContextProperty(evt.target);
					var inj = $.extend({}, self.injectVars,{'$event':evt},inject, findElemInject(elem));
					var c = createCaller(attr.value, inj);
					c(self,inj);
				});
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
		checkVDomNode(self.vdom, self.injectVars); 
		return self;
	} 

	/** 
	 * @param {vDom} on  
	 */
	function checkVDomNode(on, inject){
		//console.log(on);
		var nodeChanged = false;
		if (on && on.getters){
			for (var key in on.getters){
				if (!on.getters.hasOwnProperty(key))
					continue;
										
				if (attributes[key]){
					
					var dirResult =executeAttribute(key, on, inject);
					//if directives[key](on, inject) returns false, means return right away
					if (dirResult === true)
						nodeChanged = true;
					if (dirResult === false)
						return false;
				}
			};
		
			for( var i in  on.items){
				if (!on.items.hasOwnProperty(i))
					continue;
				if (checkVDomNode(on.items[i], inject) === true){
					nodeChanged = true;
				}
			};
		}else if (!on){
			console.log("AAAA");
		}
		return nodeChanged;
	}

	function executeAttribute(attribute, on, inject){
		var old = on.values[attribute];
		try{
			var ret = attributes[attribute](on,inject)
		}catch(ex){
			//this may cause an error
			console.warn(ex);
		}
		if (old !== on.values[attribute] && ret !== false){
			ret = true;
		}
		return ret;
	}

	/**
	 * Custom attribute handling goes here
	 */
	var attributes = {
		'[transition]':function(on, inject){
			var key = "[transition]";
			var getter = on.getters[key];
			var options;
			try{
				options = getter(self,inject);
			}catch(ex){
				options = {};
			}

			options = $.extend({
				trigger:null,
				duration: 0,
				enter:'enter',
				enter_active:'enter_active',
				enter_to:'enter_to',
				leave:'leave',
				leave_active:'leave_active',
				leave_to:'leave_to'
			},options);
			
			if (on.values[key] !== options.trigger){
				on.values[key] =  options.trigger;
				if ( on.items.length ==0){
					//if if directive does not have any children, create them
					vDomCreateItems(on,inject)
				}else{
					if (options.duration){
						vDomCreateItems(on,inject)

						$(on.items[1].elem).addClass(options.enter_active);
						$(on.items[0].elem).addClass(options.leave_active);

						$(on.items[1].elem).addClass(options.enter);
						$(on.items[0].elem).addClass(options.leave);

						setTimeout(function(){
							$(on.items[1].elem).scrollTop($(on.items[0].elem).scrollTop());

							$(on.items[1].elem).removeClass(options.enter);
							$(on.items[0].elem).removeClass(options.leave);
							
							$(on.items[1].elem).addClass(options.enter_to);
							$(on.items[0].elem).addClass(options.leave_to);

						},0);
						//discard vDom nodes of the element that will be removed
						on.items[0].items=[];
						setTimeout(function(){
							$(on.items[1].elem).removeClass(options.enter_active);
							$(on.items[0].elem).removeClass(options.leave_active);
							$(on.items[1].elem).removeClass(options.enter_to);
							$(on.items[0].elem).removeClass(options.leave_to);

							removeElement(on.items[0].elem);
							on.items.shift();
						},options.duration);
						return false;
					}	
					checkVDomNode(on.items[0],{});
				}
			}else{
				checkVDomNode(on.items[0],{});
			}	
		},
		'bind':function(on, inject){
			var key = "bind";
			var getter = on.getters[key];
			var newValue = undefined;
			try{
				newValue = getter(self, inject);  
			}catch(ex){}	
			on.values[key] = newValue;
			updateBoundElement(on.elem, newValue);
			
		},
		'[selected]':function(on, inject){
			var key = "[selected]";
			var getter = on.getters[key];
			var newValue = getter(self, inject); 
			if (newValue){
				on.elem.setAttribute('selected',"");
			}else{
				on.elem.removeAttribute('selected');
			}
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
				if (!on.valuesD.hasOwnProperty(key)){
					on.valuesD[key] = on.elem.className;
				}else{
					on.elem.className = on.valuesD[key];
				}

				if (!empty(newValue) && on.elem.className.indexOf(newValue) < 0){
					on.elem.className += (on.elem.className ? " " : "" )+ newValue;
				}
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
						removeElement(on.items[0].elem, true);
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
			
			var fo = document.createDocumentFragment();
			
			var touchedKeys = {};
			
			//remove all items temporarely (not right away)
			function moveAllToFragment(){
				for (var index in on.items){
					if (!on.items.hasOwnProperty(index))
						continue;	
					fo.appendChild(on.items[index].elem);
				}
			}
			
			//create a new fragment for new/updated items
			var hasNew = false;
			var hasDeleted = false;
			var hasChanges = 0;
			
			for (var index in data){
				if (!data.hasOwnProperty(index))
					continue;		
				var item = data[index];	
				if (item === undefined)
					continue;
				touchedKeys[index]=null;
				var inj = {}
				inj[parts.index] = index;
				inj[parts.item] = item;
				inj = $.extend({},inject,inj);
				if (!on.items.hasOwnProperty(index)){
					//a new item appeared
					if (!hasNew){
						hasNew = true;
						moveAllToFragment();
					}

					var ret = on.itemBuilder(inj);
					on.items[index] = ret[0];
					on.items[index].elem['INJECT'] = inj;
					fo.appendChild(on.items[index].fragment || on.items[index].elem); 
				}else{
					on.items[index].elem['INJECT'] = inj;
					if (checkVDomNode(on.items[index], inj)===true){
						hasChanges ++;
					}
				}
			};
			//delete vdom.items that were not in the data object
			for (var index in on.items){
				if (!on.items.hasOwnProperty(index))
					continue;	
				if (touchedKeys.hasOwnProperty(index))
					continue;
				hasDeleted = true;	
				removeElement(on.items[index].elem);
				delete on.items[index];
			}

			if (on.elem.parentNode){
				//if new or deleted elements, remove the old frag and insert the new one
				if (hasNew){
					insertAfter(fo, on.elem);
				}
			}else{
				console.warn("[ForEach]: element does not have a parent!",on.elem)
			}

			return false;
		},
		/**
		 * @param {vDom} on  
		 * @param {*} inject 
		 */
		'[directive]':function(on, inject){
			var key = "[directive]";
			var getter = on.getters[key];
			var html = getter(self,inject);

			if (html instanceof BaseComponent){
				on.getters["[component]"] = getter;
				return attributes["[component]"](on, inject);
			}
						
			if (on.values[key] !== html){
				on.values[key] = html;
					 
				/** @type {vDom} */
				var compVdom = null;

				if (html){
					if(html instanceof DocumentFragment){
						compVdom = { elem:html, fragment: null, items:[], values:{},valuesD:{},getters:{},setters:{},itemBuilder:null,inject:{}};
					}else{
						var temp = document.createElement('div');
						temp.innerHTML = html;
						compVdom = executeSource(parseElement(temp), inject);
					}
				}
				
					var templateVdom = on.itemBuilder(inject)[0];
					templateVdom.elem['INJECT'] = inject;
					$(templateVdom.elem).empty();						
					if (compVdom) {
						// @ts-ignore
						$(templateVdom.elem).append(compVdom.elem.childNodes);
						//both the componenet and template VDOMs are on the same level
						templateVdom.items = compVdom.items;
					}
					on.items[0] = templateVdom;
					insertAfter(templateVdom.elem, on.elem);
				
					for( var i in  on.items){
						if (!on.items.hasOwnProperty(i))
							continue;
						checkVDomNode(on.items[i], inject);
					};
			} else {
				//just update its items
				for( var i in  on.items){
					if (!on.items.hasOwnProperty(i))
						continue;
					checkVDomNode(on.items[i], inject);
				};
			}
			
			return false;
		},
		/**
		 * 
		 * @param {vDom} on  
		 * @param {*} inject 
		 */
		'[component]':function(on, inject){
			var key = "[component]";
			var getter = on.getters[key];
			/** @type {BaseComponent} */
			var component = getter(self,inject);

			if (on.values[key] !== component) {
				on.values[key] = component;
				if (!(component instanceof BaseComponent)){
					return false;
				}
				//crear any previous component elements
				if (on.items.length>0){
					on.items.forEach(item => {$(item.elem).remove()});
				}
				//call onInit method
				tryCall(component,component.onInit, on.elem);
			
				var inj = $.extend({}, inject);
				if (component.html) {
					var temp = document.createElement('div');
					temp.innerHTML = component.html;
					component.binder = new Binder(component, temp).setInjectVars(inj).bindElements(component.events);
					
					var c_vDom = component.binder.vdom;

					//build parent vDom in the parent scope
					/** @type {vDom} */
					var p_vDom = on.itemBuilder(inject)[0];

					//swap children between componenet temp element and the parent's element
					var p_frag = document.createDocumentFragment();
					
					// @ts-ignore
					$(p_frag).append(p_vDom.elem.childNodes);
					// @ts-ignore
					$(p_vDom.elem).append(c_vDom.elem.childNodes);

					component.parentPage = self.context;
					//let component decide where to put parent's children
					component.templateFragment = p_frag;
					component.templateUpdate = function(){
						checkVDomNode(on, inject);
					}
				} else {
					p_vDom = on.itemBuilder(inject)[0];
				}
				//parent vDom items still belong to the directive vDom node
				on.items[0] = p_vDom;

				//insert parent vDom with new children after the [component] vDom element
				insertAfter(p_vDom.elem, on.elem);
				//call onInit method in the next frame
				setTimeout(function(){
					tryCall(component,component.init, p_vDom.elem);
				});
			} else {
				//same component. Just update own parent elem vDom items
				//component items do not get updated by this!
				for( var i in  on.items){
					if (!on.items.hasOwnProperty(i))
						continue;
					checkVDomNode(on.items[i], inject);
				};
				if (component && component.binder){
					tryCall(component,component.binder.updateElements);
				}
			}
			
			return false;
		}
	}

	function applyCallBack(elem, context, evName, callback, cancelUIUpdate){
		$(elem).on(evName, function(event){	
			updateBoundContextProperty(event.target, cancelUIUpdate); //skip formatting for input event
			if ( callback && tryCall(context, callback, event) && event.target['parentNode'])
				repaint(event.target['parentNode']);
		});
	}

	function applyCallbacks(elem, context, callbacks){
		for (var k in callbacks){
			//skip if custom callback is empty or input or change
			if (empty(callbacks[k]) || k =='change' || k =='input')
				continue;
			applyCallBack(elem, context, k, callbacks[k]);	
		}
		//change or input are added separately if element is setting
		if (isElementSetting(elem)){
			if (isElementSettingOnInput(elem)){
				applyCallBack(elem, context, 'input', callbacks['input'], true);	
			}
			applyCallBack(elem, context, 'change', callbacks['change']);	
		}
	}
	function createExecuteElemAttrGetter(elem,attrName,attrValue ){
	
		try{
			var inj = findElemInject(elem);
			if (empty(elem.VDOM.getters[attrName]))
				elem.VDOM.getters[attrName] = createGetter(attrValue, inj);
			var result = elem.VDOM.getters[attrName](self, inj);
		}catch(ex){
			var result = null;
		}
		return result;
	}
	function updateBoundElement(elem, v){
		var format =  elem.getAttribute ? elem.getAttribute('format') : null;
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
			if (formats.length > 0 && formats[0] === "time") {
				v = DateTime.toHumanTime(v);
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
			case undefined: //for text nodes
				if (elem.nodeValue !== v )
					elem.nodeValue = toInputValue(v);
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
				if (formats.length > 0 && formats[0] == "time") {
					if (formats.length == 1) {
						v = DateTime.fromHumanTime(value);
					}
				}
			}else{
				v = value;
			}
			return v;
		}
	
		if (!isElementSetting(elem) || empty(elem['VDOM'].setters.bind))
			return;
		var v;

		var format = elem.getAttribute('format');
		var type = elem.getAttribute('type');

		switch (elem.tagName) {
			case "SELECT":
				var sel = $(elem).find("option:selected");
				v = formatValue(sel[0].getAttribute('value'),format);
				//console.log(v);
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
		var inj = $.extend({}, self.injectVars, findElemInject(elem));

		var domElVal = elem['VDOM'].getters.bind(self, inj);
		var vDomdomElVal = elem['VDOM'].values.bind;
		if ( domElVal !== v || v !== vDomdomElVal){
			
			if (skipUpdate && self.context[isSkipUpdate] === false){
				self.context[isSkipUpdate] = true;
				elem['VDOM'].setters.bind(self, inj, v);
				self.context[isSkipUpdate] = false;
			}else{
				elem['VDOM'].setters.bind(self, inj, v);
			}
		}
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
			var getter = new Function('context', 'inject',
					`${inj}
					return (function(){
						return ${expression};
					}).call(context.context);`
	 		);       
			getterCashe[cashe] = getter;
			// @ts-ignore
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
			var getter = new Function('context','inject',
				`${inj}
				(function(){
					${expression};
				}).apply(context.context);`
			);
			getterCashe[cashe] = getter;
			// @ts-ignore
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
			// @ts-ignore
			return new Function('context','inject', 'value',
				`${inj}
				return (function(value){
					return ${expression} = value;
				}).call(context.context, value);`
			);
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
