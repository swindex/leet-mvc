import { empty, tryCall } from "./helpers";
import { BaseComponent } from "../components/BaseComponent";
import { isObject, isString } from "util";

import * as $ from 'jquery';

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

	this.bindAttributes = {
		'[if]': function (/** @type {HTMLElement}*/elem,attrValue){ 
			var result = createExecuteElemAttrGetter(elem,'[if]',attrValue);
			var div;
			if (result){
				if(elem['TEMPLATE']['STATE'] !== result){
					if (elem['TEMPLATE']['BINDER'] && elem['TEMPLATE']['BINDER'].container){
						removeElement(elem['TEMPLATE']['BINDER'].container);
					}

					div = elem.cloneNode(true) ;
					// @ts-ignore //attributes exists on Node. 
					div.attributes.removeNamedItem('[if]');
					elem['TEMPLATE']['BINDER'] = (new Binder(self.context,div)).setInjectVars(self.injectVars).bindElements(self.eventCallbacks);//.updateElements();
					insertAfter(div, elem['TEMPLATE']['PLACEHOLDER']);
				}else
					elem['TEMPLATE']['BINDER'].setInjectVars(self.injectVars).updateElements();
			}else{
				if (elem['TEMPLATE']['BINDER'] && elem['TEMPLATE']['BINDER'].container){
					removeElement(elem['TEMPLATE']['BINDER'].container);
				}
			}
			elem['TEMPLATE']['STATE'] = result;
		},		
		'[foreach]': function (/** @type {HTMLElement}*/elem,attrValue){ 
				var index = null;
				
				var p = getForeachAttrParts(attrValue);				
			
				var data = createExecuteElemAttrGetter(elem,'[foreach]',p.data);
				if (empty(data))
					data = [];

				var keys = Object.keys(data);
				if (!elem['TEMPLATE']['BINDERS'])
					elem['TEMPLATE']['BINDERS']={}
				var fragment = document.createDocumentFragment();
				var touchedKeys = {};
				for (index in data){
					if (! data.hasOwnProperty(index)) continue;	
					//remember indexes that were added/updated
					touchedKeys[index]=null;
					//build up injectable values
					var inj = $.extend({},self.injectVars);
					inj[p.index] = index;
					inj[p.item] = data[index];

					if (elem['TEMPLATE']['BINDERS'].hasOwnProperty(index)){
						//index already exists in binders. update it
						removeElement(elem['TEMPLATE']['BINDERS'][index].container);
						elem['TEMPLATE']['BINDERS'][index].setInjectVars(inj).updateElements();
						fragment.appendChild(elem['TEMPLATE']['BINDERS'][index].container);
					}else{
						//index does not exist. create it
						var div = elem.cloneNode(true) ;
						// @ts-ignore //attributes exists on Node. 
						div.attributes.removeNamedItem('[foreach]');
						fragment.appendChild(div);
				
						elem['TEMPLATE']['BINDERS'][index] = (new Binder(self.context,div)).setInjectVars(inj).bindElements(self.eventCallbacks);//.updateElements();
					}
				}
				//delete indexes thet were not in the data object
				for (index in elem['TEMPLATE']['BINDERS']){
					if (!elem['TEMPLATE']['BINDERS'].hasOwnProperty(index))
						continue;	
					if (touchedKeys.hasOwnProperty(index))
						continue;
					removeElement(elem['TEMPLATE']['BINDERS'][index].container);
					delete elem['TEMPLATE']['BINDERS'][index];
				}

				insertAfter(fragment, elem['TEMPLATE']['PLACEHOLDER']);

				elem['TEMPLATE']['STATE'] = keys.length;
				insertAfter(fragment, elem['TEMPLATE']['PLACEHOLDER']);

			},	

		'[directive]': function (/** @type {HTMLElement}*/elem, attrValue){ 
			var result = createExecuteElemAttrGetter(elem,'[directive]',attrValue);
			
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
				//component = null;
				callbacks = self.eventCallbacks;
			}

			if (elem.attributes.hasOwnProperty('[directive]'))		
				elem.attributes.removeNamedItem('[directive]');
			if (elem['TEMPLATE']['STATE'] !== result){
				elem['TEMPLATE']['STATE'] = result;		
				if (html !== null)
					elem.innerHTML = html;
				elem['TEMPLATE']['BINDER'] = (new Binder(self.context,elem)).setInjectVars($.extend({component:component},self.injectVars)).bindElements(callbacks);
				if (isObject(result)){
					result.binder=elem['TEMPLATE']['BINDER'];
					tryCall(result,result.init,elem)
				}
				

			}else{
				elem['TEMPLATE']['BINDER'].setInjectVars($.extend({component:component},self.injectVars)).updateElements();
			}	
		},
		'[innerHTML]':function (elem,attrValue){
				var result = createExecuteElemAttrGetter(elem,'[innerHTML]',attrValue);
				if (elem.innerHTML!==result)
					elem.innerHTML = result;
			},
		'[display]': function (elem,attrValue){ 
				elem.style.display = createExecuteElemAttrGetter(elem,'[display]',attrValue);
			},
		'[style]': function (/** @type {HTMLElement}*/elem,attrValue){ 
				var r = createExecuteElemAttrGetter(elem,'[style]',attrValue);
				if (typeof r =='object'){
					$.each(r,function(i,prop){
						if (prop!==null)
							elem.style[i]=prop;
						else
							elem.style[i] = 'auto';	
					})
				}
			},
		'[class]': function (/** @type {HTMLElement}*/elem,attrValue){ 
				if (typeof elem['TEMPLATE']['className_original'] ==='undefined')
					elem['TEMPLATE']['className_original'] = elem.className;
				
				var result = createExecuteElemAttrGetter(elem,'[class]',attrValue);
				if (!empty(result) && elem.className.indexOf(result) < 0)
					elem.className += " "+ result;
				else if (empty(result))
					elem.className = elem['TEMPLATE']['className_original']	
			},
		'[selected]': function (elem,attrValue){ 
			var r = createExecuteElemAttrGetter(elem,'[selected]',attrValue);
			if (r){
				elem.setAttribute('selected',"");
			}else
				elem.removeAttribute('selected');
		},
		'[attribute]': function (elem,attrValue){ 
			var r = createExecuteElemAttrGetter(elem,'[attribute]',attrValue);
			if (typeof r =='object'){
				$.each(r,function(i,prop){
					if (prop!==null)
						elem.setAttribute(i,prop);
					else
						elem.removeAttribute(i);	
				})
			}
		},
		/*'[onload]': function (elem,attrValue){ 
			var r = createExecuteElemAttrGetter(elem,'[onload]',attrValue);
		},	*/	
		
	};

	this.beforeBindAttributes = {
		'[directive]': function (/** @type {HTMLElement}*/elem, attrValue){
			elem['TEMPLATE']['PLACEHOLDER'] = document.createComment("[directive]:"+attrValue);
			//insert placeholder
			if (!elem.parentElement){
				console.log("AAAA");
			}
			insertBefore(elem['TEMPLATE']['PLACEHOLDER'],elem);
			return true;
		 },
		'[if]': function (/** @type {HTMLElement}*/elem, attrValue){ 
			elem['TEMPLATE']['PLACEHOLDER'] = document.createComment("[if]:"+attrValue);
			//insert placeholder
			if (!elem.parentElement){
				console.log("AAAA");
			}
			insertBefore(elem['TEMPLATE']['PLACEHOLDER'],elem);
			$(elem).remove();
			return true;
		},
		'[foreach]': function (/** @type {HTMLElement}*/elem, attrValue){
			elem['TEMPLATE']['PLACEHOLDER'] = document.createComment("[foreach]:"+attrValue);
			//insert placeholder
			insertBefore(elem['TEMPLATE']['PLACEHOLDER'],elem);
			$(elem).remove();
			return true;
		},	
	
	};
	function insertBefore(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	function insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
	//
	function createExecuteElemAttrGetter(elem,attrName,attrValue ){
	
		try{
			if (empty(elem.TEMPLATE.GETTERS[attrName]))
				elem.TEMPLATE.GETTERS[attrName] = createGetter(attrValue);
			var result = elem.TEMPLATE.GETTERS[attrName](self);
		}catch(ex){
			var result = null;
		}
		return result;
	}
	function removeElement(elem){
		if (elem.parentElement)
			elem.parentElement.removeChild(elem);
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
		
		bindElement(self.container);

		fireOnLoadEvents(self.container);
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

	function fireOnLoadEvents (elem){
		//fire onload event
		var ol = elem.getAttribute('[onload]');
		if (ol){
			var r = createExecuteElemAttrGetter(elem,'[onload]',ol);	
			elem.removeAttribute("[onload]");
		}	
	}

	/**
	 * @param {HTMLElement|Element} elem
	 */
	function bindElement(elem){
		//if already bound continue
		if (self.bindings.indexOf(elem)<0){
				
			assertElemTemplate(elem);
			var didBind = false;
			var wasRemoved = false;
			
			for(var attr in self.beforeBindAttributes){
				var atv =  elem.getAttribute(attr)
				if (atv){
					self.beforeBindAttributes[attr](elem, atv);
					elem['TEMPLATE']['BOUND_ATTR'].push({name:attr,value:atv});
					wasRemoved = true;	
					didBind = true;
				}
			}	
			if (!wasRemoved){	
				
				//bind 'this' inside event's handler to the context and inject vars
				bindEventsToContext(elem);
				
				//bind the element to context data if needed
				var bexpression = elem.getAttribute('bind');
				if (bexpression !== null){
					if (!empty(bexpression)){
						elem['TEMPLATE'].GETTERS['value'] = createGetter( bexpression);
						if (isElementSetting(elem))
						elem['TEMPLATE'].SETTERS['value'] = createSetter( bexpression);
					}

					//if element is bound add events from the eventCallbacks array
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

					//Add change handlers to all form elements regardless whether there are eventCallbacks
					if (isElementSetting(elem)){
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
					didBind = true;
				}

				//if contains bindable attributes, add them to elem BOUND_ATTR array, so it can be used fast
				for(var attr in self.bindAttributes){
					var atv =  elem.getAttribute(attr)
					if (atv){
						didBind = true;
						//if (elem['TEMPLATE']['BOUND_ATTR'].indexOf(attr)==-1)	
						elem['TEMPLATE']['BOUND_ATTR'].push({name:attr,value:atv});
						if (!wasRemoved){
							elem.attributes.removeNamedItem(attr);
						}
					}
				}
			}

			if (didBind){
				self.bindings.push (elem);
				updateElement(elem);
			}
			if (!wasRemoved){
				bindElementChildren(elem);
				
				fireOnLoadEvents(elem);
			}
		}
	}

	/** @param {HTMLElement|Element} element */
	function bindElementChildren(element){
		var inputs = element.children;
		var inputs_length = inputs.length;
		for(var i =0; i< inputs.length; i++){
			var elem = inputs[i];

			bindElement(elem);
			//if binding of the element caused the length to change, backstep the index 
			if (inputs_length != inputs.length){
				i -= inputs_length - inputs.length
				inputs_length = inputs.length
			}
		}
	}

	function assertElemTemplate(elem){
		if (empty(elem['TEMPLATE']))	
			elem['TEMPLATE'] = {
				innerHTML:"",
				GETTERS:{},
				SETTERS:{},
				BOUND_ATTR:[]
			};	
	}

	/**
	 * Bind element's events to context
	 * @param {HTMLElement|Element} elem
	 */
	function bindEventsToContext(elem){
		Array.prototype.slice.call(elem.attributes).forEach(function(attr) {
			if (attr.name.substr(0,2)=='on' && typeof elem[attr.name] =='function'){
				elem[attr.name] = (function(evt){
					//setTimeout(()=>{
					updateBoundContextProperty(evt.target);
					self.injectVars['$event'] = evt;
					var c = createCaller(attr.value);
					c(self);
					//},1);
				}).bind(self);
			}	
		});
	}

	/**
	 * Update DOM elements according to bindings
	 */
	this.updateElements = function(){
		//this.context.injectVars = $.extend(true,{}, this.injectVars);
		for (var i in this.bindings){
			if (this.bindings[i]!= null)
				updateElement(this.bindings[i]);
		}
		return self;
	}

	function updateElement(elem){
		
		if (!empty(elem['TEMPLATE']) && !empty(elem['TEMPLATE']['BOUND_ATTR'])){

			for(var i in elem['TEMPLATE']['BOUND_ATTR']){
				var tag = elem['TEMPLATE']['BOUND_ATTR'][i].name;
				var arrtValue = elem['TEMPLATE']['BOUND_ATTR'][i].value
				self.bindAttributes[tag](elem,arrtValue);
			}
		}
		updateBoundElement(elem)

		if (elem.getAttribute("once")!== null){
			elem.removeAttribute("bind");
			var ii = self.bindings.indexOf(elem);
			if (ii>=0){
				self.bindings[ii] = null;
			}
			self.bindings.push.apply(self.bindings,elem['TEMPLATE']['BINDER'].bindings);
		}
	}

	function updateBoundElement(elem){

		var bind = elem.getAttribute('bind');

		if (empty(bind))
			return null;
		
		try{
			if (!elem['TEMPLATE'].GETTERS.value)
				return null;
			var v= elem['TEMPLATE'].GETTERS.value(self);
		}catch (ex){
			console.log(ex.message,bind);
			if (self._capturePropOfUndefined){
				var m = bind.match(self._capturePropOfUndefined.pattern);
				if(m){
					var ml = m[0].length;
					var prop = bind.substr(ml);
					if (!self._capturePropOfUndefined.object[prop]){
						self._capturePropOfUndefined.object[prop] = elem.innerHTML;
					}
				}
			}

			return null;
		}
		if (typeof v == "undefined")
			v = "";

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
						throw Error("Value of " + bind + " is not part of format's boolean options");
				}
			}
		}
		switch (elem.tagName) {
			case "SELECT":
				$(elem).find("option").removeAttr('selected');
				window.requestAnimationFrame(()=>{
					if (v===null)
						$(elem).find("option[value='']").first().attr('selected',"");
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
						elem.value = v;
						break;
				}
				break;
			case "IMG":
				if (elem.src !== v)
					elem.src = v;
				break;
			default:
				if (elem.innerText !== v )
					elem.innerText = v;
				break;	
		}
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
					if (value==="")
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
			}else{
				v = value;
			}
			return v;
		}
	
		if (!isElementSetting(elem) || empty(elem['TEMPLATE'].SETTERS.value))
			return;
		var bind = elem.getAttribute('bind');
		if (empty(bind))
			return;

		var v;

		var format = elem.getAttribute('format');
		var type = elem.getAttribute('type');

		switch (elem.tagName) {
			case "SELECT":
				var sel = $(elem).find("option:selected");
				v = formatValue(sel.val(),format);
				
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
		var oldval = elem['TEMPLATE'].GETTERS.value(self);
		if (oldval !== v){
			if (skipUpdate && self.context['skipUpdate'] === false)
				self.context['skipUpdate'] = true;

			elem['TEMPLATE'].SETTERS.value(self, v);
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
	 * @return {function(*)} callback
	 */
	function createGetter(expression){
		var inj = createInjectVarText(self.injectVars);
		try{
			var cashe = inj+expression;
			if ( getterCashe.hasOwnProperty(cashe))
				return getterCashe[cashe];
			var getter = eval.call(this, 
						`(function (context){
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
	 * @return {function(*)} callback
	 */
	function createCaller(expression){
		var inj = createInjectVarText(self.injectVars);
		try{
			var cashe = inj+expression;
			if ( getterCashe.hasOwnProperty(cashe))
				return getterCashe[cashe];
			var getter = eval( 
						`(function (context){
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
	 * @return {function(*,*)} callback
	 */	
	function createSetter(expression){
		var inj = createInjectVarText(self.injectVars);
		
		try{
			return eval.call(self.context, `(function (context, value){
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
				inj +="var " + i + "= context.injectVars['"+i+"'];\n";
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