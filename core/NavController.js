import { tryCall, empty, argumentsToArray } from "./helpers";
import { BasePage } from "../pages/BasePage";
import { isSkipUpdate } from "./Watcher";
import { Objects } from "./Objects";

export function NavController() {
	/** @type {NavController} */
    var self = this;

	/**
	 * @typedef Page
	 * @prop name
	 */

	/**
	 * @typedef PageFrame
	 * @prop {string} name
	 * @prop {JQuery<Element>} element
	 * @prop {object} page
	 */
	/** @type {PageFrame[]} */
	var stack = [];

	var windowSize ={width:null, height:null};

	var backTimeout = 300;
	var backTimeoutRunning = false;
	
	var transitionTime = 400;

	var pageContainer = document.body;

	/**
	 * @param {HTMLElement} container
	 */
	this.setContainer = function(container, listenTobBackButton = false){
		pageContainer = container
		//if container is not document, remove the back button handler
		if (pageContainer != document.body && !listenTobBackButton){
			$(document).off('backbutton',documentBackButtonHandler);
		}
	}

	/**
	 * Remove all pages and load passed page Constructor as Root
	 * @param {object} pageConstructor
	 * @param {...any} [parameters] 
	 * @return {BasePage}
	 */
	this.setRoot = function(pageConstructor, parameters){
		removeAllFrames();
		self.onPageNavigateTo(pageConstructor.name);
		var page = createPage(pageContainer, pageConstructor, argumentsToArray(arguments,1));
		self.onPageCreated(page);
		return page;
	}
	/**
	 * Remove All Pages
	 */
	this.removeAll = removeAllFrames;
	/**
	 * Push a page on top of stack.
	 * @param {object} pageConstructor 
	 * @param {...any} [parameters]  
	 */
	this.push = function(pageConstructor, parameters){
		if (currentFrame())
			tryCall(currentFrame().page, currentFrame().page.onLeave);		
		self.onPageNavigateTo(pageConstructor.name);
		var page = createPage(pageContainer, pageConstructor, argumentsToArray(arguments,1));
		self.onPageCreated(page);
		return page;
	}

	/**
	 * Push a page on top of stack INTO a specified element
	 * @param {HTMLElement} container
	 * @param {object} pageConstructor 
	 * @param {...any} [parameters]  
	 */
	this.pushInto = function(container, pageConstructor, parameters){
		if (currentFrame())
			tryCall(currentFrame().page, currentFrame().page.onLeave);		
		self.onPageNavigateTo(pageConstructor.name);
		var page = createPage(container, pageConstructor, argumentsToArray(arguments,2));
		self.onPageCreated(page);
		return page;
	}
	/**
	 * Navigate Back
	 * Returns true if success, null if last page and can not go back
	 * @return {null|boolean} 
	 */
	this.back = function(){
		if (stack.length>1){
			if (backTimeoutRunning)	return false;
			backTimeoutRunning = true;
			setTimeout(function(){backTimeoutRunning = false},backTimeout);

			removeLastFrame();
			self.onPageNavigateBack(currentFrame().name);
			resetPagesVisibility();	
			
			return true;
		}
		return null;
	} 
	/**
	 * Remuve page from stack
	 * @param {Page} pageObject 
	 */
	this.remove = function(pageObject){
		for (var i=0 ; i< stack.length ; i++){
			if (stack[i].page ===pageObject){
				removeFrameN(i);
				break;
			}
		}
		resetPagesVisibility();
	}
	/**
	 * Get a list of displayed pages
	 * @return {string[]}
	 */
	this.getPageNames = function(){
		var ret = [];
		Objects.forEach(stack,function(){ret.push(this.name)});
		return ret;
	}

	/**
	 * Get Pages Stack
	 * @return {PageFrame[]}
	 */
	this.getPages = function(){
		var ret = [];
		return stack;
	}
	/**
	 * Create page 
	 * @param {HTMLElement} container
	 * @param {any} pageConstructor 
	 * @param {any[]} args - array of arguments to pass to the page constructor
	 * @return {BasePage|Promise} 
	 */
    function createPage(container, pageConstructor, args) {

		function insertIntoDOM(pageObject) {
			//if pbject is vue, mount it first
			if (pageObject._isVue) {
				var newEl = document.createElement('div');
				$(container).append(newEl);
				pageObject.$args = args;
				pageObject.$mount(newEl);
				var p = pageObject.$el;
			} else {	
						
				tryCall(pageObject, pageObject._init);
				var p = pageObject.page;
				p.prop('id', pageObject.selector);
				$(container).append(p);
			}

			pageObject.Nav = self;
			pageObject.style.zIndex = getMaxStackZIndex() + 100;

			var classes = !empty(pageObject.className) ? (pageObject.className).split(" ") : [];
			classes.push(className);
			pageObject.className = classes.join(' ');

			stack.push({name:pageObject.name, element: p, page: pageObject});
			resetPagesVisibility();
			
			tryCall(pageObject, pageObject.onInit, p);	

			setTimeout(()=>{
				tryCall(pageObject, pageObject.onLoaded);		
			},1);

			return pageObject;
		}
		
		if (pageConstructor instanceof Promise) {
			//constructor is a promise.
			//Resolve it!
			return pageConstructor.then( _pageConstructor => {
				//call it again
				return createPage (container, _pageConstructor, args);
			});
		} else if (typeof pageConstructor == "function") {
			var selector = pageConstructor.selector ? pageConstructor.selector : 'page-' + pageConstructor.name;
			var className = pageConstructor.className ? pageConstructor.className : "" ;

			//create page object in a new scope
			/** @type {BasePage} */
			var pageObject = createPageInstance(pageConstructor, args);
			//pageObject.visibleParent = pageObject.visibleParent===null ? pageConstructor.visibleParent : pageObject.visibleParent;
			pageObject.name = pageConstructor.name;
			//empty(pageObject.className) ? pageObject.className = className : null;
			pageObject.selector = selector;
			return insertIntoDOM(pageObject);

		} else {
			//create page object in a new scope
			/** @type {BasePage} */
			var pageObject = pageConstructor;
			pageConstructor = pageObject.constructor;

			var name = (pageConstructor.name + "").replace(/bound /g, "");

			//var selector = pageConstructor.selector ? pageConstructor.selector : 'page-' + name;
			var className = pageConstructor.className ? pageConstructor.className : "" ;
	
			pageObject.name = name;
			//empty(pageObject.className) ? pageObject.className = className : null;
			//pageObject.selector = selector;
			return insertIntoDOM(pageObject);
		}
		
	}

	function getMaxStackZIndex(){
		var maxZ = 0;
		for (var i=0 ; i< stack.length ; i++){
			var frame = stack[i];
			maxZ = Math.max(maxZ, frame.page.style.zIndex);
		}
		return maxZ;
	}

	/**
	 * 
	 * @param {any} pageConstructor 
	 * @param {any[]} args 
	 */
	function createPageInstance(pageConstructor, args){
		/*var page = Object.create(pageConstructor.prototype);
		var ret = pageConstructor.apply(page, args);
		return ret ? ret : page;*/
		return new pageConstructor( ...args );
	}

	function removeFrameN (frameIndex){
		var frame = stack.splice(frameIndex,1)[0];

		tryCall(frame.page, frame.page.onLeave);
		tryCall(frame.page, frame.page._onDestroy);		
		hidePageElement(frame, true);	
		frame = null;
		return true;
	}
	function removeLastFrame (){
		if (stack.length===0)
			return null;
		return removeFrameN(stack.length-1);
	}
	/**
	 * Return current page frame
	 * @return {PageFrame}
	 */
	function currentFrame (){
		if (stack.length===0)
			return null;
		return stack[stack.length-1];
	}
	function removeAllFrames() {
		if (stack.length===0)
			return null;

		if (removeLastFrame())
			removeAllFrames();
		
	}
	/**
	 * Set Page instance UI state value
	 * @param {object} page 
	 * @param {'isDeleting'|'isCreating'|'isHiding'|'isShowing'|'isVisible'|'isHidden'} state 
	 */
	function setPageState(page, state){
		if (page[state] == true){
			return;
		}
		page.isDeleting = null;
		page.isCreating = null;
		page.isHiding = null;
		page.isHidden = null;
		page.isShowing = null;
		page.isVisible = null;
		
		page[state] = true;
	}
	/**
	 * Recalculate pages' visibility
	 */
	function resetPagesVisibility(){
		var n=0;
		var hideAfter = 1;
		for (var i = stack.length-1 ; i >=0 ; i--){
			var frame = stack[i];
			if (i==0) {
				frame.page.isRoot = true;
			} else {
				frame.page.isRoot = null;
			}
			if (!empty(frame.page.visibleParent))
				hideAfter++;
			if (hideAfter > n){
				showPageElement(frame, i < stack.length-1);
			}else{	
				hidePageElement(frame);				
			}
			n++;
		}
	}

	/**
	 * Show particular page DOM element
	 * @param {PageFrame} frame - page to show
	 * @param {boolean} [inactive] 
	 */
	function showPageElement(frame, inactive){
		setTimeout(function(){
			if (frame.page.isDeleting) {
				return;
			}
			
			if ( frame.page.isHidden) {
				setPageState(frame.page,'isShowing');
				setTimeout(function(){
					tryCall(frame.page,frame.page.onEnter);		
				},0);
			} else if ( !frame.page.isHidden && !frame.page.isHiding && !frame.page.isVisible){
				//if page is not yet have any attributes
				setPageState(frame.page,'isCreating');

				//Add creating attribute ALMOST immedaitely for smooth appearance
				setTimeout(function(){
					tryCall(frame.page,frame.page.resize, windowSize);		
				},0);

				setTimeout(function(){
					tryCall(frame.page,frame.page.onEnter);		
				},0);
			}
			
			if (inactive){
				frame.page.isInactive = true;
			} else {
				frame.page.isInactive = null;
			}

			//Set to fully visible after 500ms delay
			setTimeout(function(){
				if ( frame.page.isDeleting) {
					return;
				}
				
				
				if (!frame.page.isVisible) {
					tryCall(frame.page, frame.page._onVisible);
				}
				setPageState(frame.page,'isVisible');
			},transitionTime);	
		});
		
	}

	/**
	 * Hide particular page DOM element
	 * @param {PageFrame} frame - page to show
	 * @param {boolean} [isDeleting] - true if page is being deleted
	 */
	function hidePageElement(frame, isDeleting){
		var element = frame.element;
		isDeleting = isDeleting || false;

		if (frame.page.isDeleting )
			return;
		function doHideElem(isDeleting){
			window.requestAnimationFrame(function(){
				setPageState(frame.page, 'isHidden');
				if (isDeleting){
					frame.page[isSkipUpdate] = true;
					frame.page.Nav = null;
					frame.page.destroy(true);
				}
			})
		}
		if(!isDeleting && frame.page.isHidden){
			doHideElem();
		}else{
			if (isDeleting){
				setPageState(frame.page,'isDeleting');
			}else{
				setPageState(frame.page,'isHiding');
			}
			setTimeout(function(){
				doHideElem(isDeleting);
			},isDeleting ? transitionTime : transitionTime + 100);	//hiding takes 100 ms longer than deleting
		}
	}

	//Set default window size cashe
	windowSize.width = $(window).width();
	windowSize.height = $(window).height();
	//add ONE listener that will fire onResize on all pages;
	$(window).on('resize', windowResizeHandler);
	function windowResizeHandler (ev){
		windowSize.width = $(window).width();
		windowSize.height = $(window).height();
		
		for(var i=0 ; i<stack.length;i++){
			//recalcContentHeight(stack[i].element);
			tryCall(stack[i].page, stack[i].page.resize, windowSize);
		}
	}

	$(document).on("backbutton", documentBackButtonHandler);
	function documentBackButtonHandler(e) {
		var cf = currentFrame();
		if (cf && tryCall(cf.page, cf.page.onBackNavigate)!== false && tryCall(cf.page, cf.page.onBeforeDestroy)!== false && self.back()===null){
			self.onRootPageBackPressed(cf.name);
		}
	}
	
	/**
	 * Delete Event handlers that were created by the Nav instance
	 */
	this.destroy = function(){
		$(window).off('resize',windowResizeHandler);
		$(document).off('backbutton',documentBackButtonHandler);
	}

	/**
	 * ***Override***
	 * Callback fired when Back button is clicked on LAST page of the app 
	 * @param {string} name
	 */
	this.onRootPageBackPressed = function (name){}
	/**
	 * ***Override***
	 * Callback fired on page forward
	 * @param {string} name 
	 */
	this.onPageNavigateTo = function (name){}

	/**
	 * ***Override***
	 * Callback fired when page is created
	 */
	this.onPageCreated = function(page){}
	/**
	 * Callback fired when page is navigated "back" to
	 * @param {string} name 
	 */
	this.onPageNavigateBack = function (name){}
}
