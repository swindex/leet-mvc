import { tryCall, empty, argumentsToArray } from "./helpers";
import { BasePage } from "../pages/BasePage";
import { isSkipUpdate } from "./Watcher";

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
			//tryCall(currentFrame().page,currentFrame().page.onEnter);		
			
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
		//if (currentFrame())
			//tryCall(currentFrame().page,currentFrame().page.onEnter);		
	}
	/**
	 * Get a list of displayed pages
	 * @return {string[]}
	 */
	this.getPageNames = function(){
		var ret = [];
		$.each(stack,function(){ret.push(this.name)});
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
	 * @return {BasePage} 
	 */
    function createPage(container, pageConstructor, args) {

		var selector = pageConstructor.selector ? pageConstructor.selector : 'page-' + pageConstructor.name;
		var template = pageConstructor.template ? pageConstructor.template : null ;
		var className = pageConstructor.className ? pageConstructor.className : "" ;

		//create page object in a new scope
		/** @type {BasePage} */
		var pageObject = createPageInstance(pageConstructor,args);
		pageObject.template = template;
		pageObject.visibleParent = pageObject.visibleParent===null ? pageConstructor.visibleParent : pageObject.visibleParent;
		// @ts-ignore
		pageObject.Nav = self;
		pageObject.style.zIndex = (stack.length + 1)*100+"";
		pageObject.name = pageConstructor.name;

		tryCall(pageObject, pageObject._init);
		
		var p = pageObject.page;
		p.prop('id', selector);
		p.addClass(className);
		//p.css(`z-index:${(stack.length + 1)*100};`);

		$(container).append(p);

		stack.push({name:pageConstructor.name, element: p, page: pageObject});
		resetPagesVisibility();
		
		tryCall(pageObject, pageObject.onInit, p);	

		//setTimeout(()=>{
		//	tryCall(pageObject, pageObject.resize);		
		//},0);
		setTimeout(()=>{
			tryCall(pageObject, pageObject.onLoaded);		
		},1);
		
		return pageObject;
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
		//removeEvents(frame.element);
	
		tryCall(frame.page, frame.page.onLeave);
		tryCall(frame.page, frame.page._onDestroy);		
		//immediately disable drop all events for the page being removed
		//$(frame.element).off();
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
	 * @param {'isDeleting'|'isCreating'|'isHiding'|'isShowing'|'isVisible'} state 
	 */
	function setPageState(page, state){
		if (page[state] == true){
			return;
		}
		page.isDeleting = false;
		page.isCreating = false;
		page.isHiding = false;
		page.isShowing = false;
		page.isVisible = false;
		
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
			if (i==0)
				frame.element.attr('root','');
			else	
				frame.element.removeAttr('root');
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
		var element = frame.element;
		window.requestAnimationFrame(function(){
			if (typeof element.attr('deleting') !=='undefined') {
				return;
			}
			
			if (typeof element.attr('hidden') !=='undefined') {
				element.attr('revealing',"");
				setPageState(frame.page,'isShowing');
			} else if (typeof element.attr('hidden') == 'undefined' && typeof element.attr('hiding') == 'undefined'  && typeof element.attr('visible') == 'undefined'){
				//if page is not yet have any attributes
				setPageState(frame.page,'isCreating');
				//Add creating attribute ALMOST immedaitely for smooth appearance
				setTimeout(function(){
					element.attr('creating',"");
					tryCall(frame.page,frame.page.resize);		
				},0);
			}

			//immediately remove block hidden
			element.removeAttr('hidden');
			element.removeAttr('hiding');
			
			if (inactive){
				element.attr('inactive',"");
			} else {
				element.removeAttr('inactive');
			}

			if (typeof element.attr('visible') == 'undefined'){
				//fire on enter int the next frame
				setPageState(frame.page,'isShowing');
				setTimeout(function(){
					tryCall(frame.page,frame.page.onEnter);		
				},0);
			}
			//Set to fully visible after 500ms delay
			setTimeout(function(){
				if (typeof element.attr('deleting') !=='undefined') {
					return;
				}
				
				setPageState(frame.page,'isVisible');

				if (typeof element.attr('visible') == 'undefined') {
					tryCall(frame.page, frame.page._onVisible);
				}
					
				element.removeAttr('hidden');
				element.removeAttr('hiding');	
				element.removeAttr('revealing');
				element.removeAttr('creating');

				element.attr('visible','');

				
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
		var isHidden = typeof element.attr('hidden') !== 'undefined';

		if (typeof element.attr('deleting') !== 'undefined')
			return;
		function doHideElem(isDeleting){
			window.requestAnimationFrame(function(){
				element.removeAttr('deleting');
				element.removeAttr('hiding');
				element.attr('hidden','');
				if (isDeleting){
					//$(element).remove();
					frame.page[isSkipUpdate] = true;
					frame.page.Nav = null;
					frame.page.destroy(true);
					//removeDOMElement(element[0]);
				} else{	
					//element.css('display','none');
					//console.log("Hide Element",element[0].id);
				}
			})
		}
		if(isHidden){
			doHideElem();
		}else{
			element.removeAttr('visible');
			if (isDeleting){
				element.attr('deleting',"");
				setPageState(frame.page,'isDeleting');
			}else{
				element.attr('hiding',"");
				setPageState(frame.page,'isHiding');
			}
			setTimeout(function(){
				doHideElem(isDeleting);
			},isDeleting ? transitionTime : transitionTime + 100);	//hiding takes 100 ms longer than deleting
		}
	}

	//add ONE listener that will fire onResize on all pages;
	$(window).on('resize', windowResizeHandler);
	function windowResizeHandler (ev){ 
		for(var i=0 ; i<stack.length;i++){
			//recalcContentHeight(stack[i].element);
			tryCall(stack[i].page, stack[i].page.resize);
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
