import { tryCall, empty, argumentsToArray } from "./helpers";

export function NavController() {
	/** @type {NavController} */
    var self = this;

	/** @type {PageFrame[]} */
	var stack = [];

	var backTimeout = 300;
	var backTimeoutRunning = false;
	
	var transitionTime = 400;

	var pageContainer = document.body;

	/**
	 * @param {HTMLElement} container
	 */
	this.setContainer = function(container){
		pageContainer = container
	}

	/**
	 * Remove all pages and load passed page Constructor as Root
	 * @param {object} pageConstructor
	 * @param {...any} [parameters] 
	 * @return {Page}
	 */
	this.setRoot = function(pageConstructor, parameters){
		removeAllFrames();
		self.onPageNavigateTo(pageConstructor.name);
		return createPage(pageConstructor, argumentsToArray(arguments,1));
	}
	/**
	 * Push a page on top of stack.
	 * @param {object} pageConstructor 
	 * @param {...any} [parameters]  
	 */
	this.push = function(pageConstructor, parameters){
		if (currentFrame())
			tryCall(currentFrame().page, currentFrame().page.onLeave);		
		self.onPageNavigateTo(pageConstructor.name);
		var page = createPage(pageConstructor, argumentsToArray(arguments,1));
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
			tryCall(currentFrame().page,currentFrame().page.onEnter);		
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
		if (currentFrame())
			tryCall(currentFrame().page,currentFrame().page.onEnter);		
		resetPagesVisibility();
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
	 * @param {any} pageConstructor 
	 * @param {any[]} args - array of arguments to pass to the page constructor
	 * @return {Page} 
	 */
    function createPage(pageConstructor, args) {
		//currentPageName = pageConstructor.name;
		//console.time()
		var selector = typeof pageConstructor.selector !=='undefined' ? pageConstructor.selector : 'page-' + pageConstructor.name.toLowerCase() ;
		var template = typeof pageConstructor.template !=='undefined' ? pageConstructor.template : null ;
		var className = pageConstructor.className ? pageConstructor.className : "" ;

		//create page factory
		var factory = document.createElement('div');
		factory.innerHTML = `
		<div
			page
			class="${className}"
			id="${selector}"
			[style]="this.style"
			style="z-index:${(stack.length + 1)*100}"
		>
			${template}
		</div>`;

		//our actual page is the first child pf the factory
		var p = factory.firstElementChild;

		
		pageContainer.appendChild(p);

		args.unshift($(p));
		//create page object in a new scope
		var pageObject = createPageInstance(pageConstructor,args);

		pageObject.visibleParent = pageConstructor.visibleParent;
		pageObject.Nav = self;


		stack.push({name:pageConstructor.name, element: $(p), page: pageObject});
		resetPagesVisibility();

		tryCall(pageObject, pageObject.onInit);
		tryCall(pageObject, pageObject.init);
		
		recalcContentHeight($(p));
		
		//p.style.display = 'block';
		//enter done on next free frame
		window.requestAnimationFrame(()=>{
			tryCall(pageObject,pageObject.onEnter);
		});
		attachEvents(pageObject,p);

		//console.timeEnd()
		return pageObject;
	}
	/**
	 * 
	 * @param {any} pageConstructor 
	 * @param {any[]} args 
	 */
	function createPageInstance(pageConstructor, args){
		var page = Object.create(pageConstructor.prototype);
		var ret = pageConstructor.apply(page, args);
		return ret ? ret : page;
		//return new pageConstructor(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],args[9]);
	}

	function attachEvents(pageObject,p){
		if (typeof pageObject.onResize=='function')
			pageObject.onResize();

	}
	
	/**
	 * recalculate height of the standard elements
	 * @param {JQuery<HTMLElement>} p - page
	 */
	function recalcContentHeight(p){
		var h = $(window).height();
		var header = p.find('>.header').height();
		var footer = p.find('>.footer').height();

		h -= !empty(header) ? header : 0 ;
		h -= !empty(footer) ? footer : 0 ;

		p.find('.content').css('height', h +'px');
		//console.log("Content Height:", h);
	}
	function removeFrameN (frameIndex){
		var frame = stack.splice(frameIndex,1)[0];
		//removeEvents(frame.element);
	
		tryCall(frame.page, frame.page.onLeave);		
		tryCall(frame.page, frame.page.onDestroy);		
	
		//immediately disable drop all events for the page being removed
		//$(frame.element).off();
		hidePageElement(frame.element, function(element){
			$(element).remove();
		},true);
		
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
				showPageElement(frame.element, frame.page);
			}else{	
				hidePageElement(frame.element);				
			}
			n++;
		}
	}

	/**
	 * Show particular page DOM element
	 * @param {JQuery<HTMLElement>} element - page element to show
	 */
	function showPageElement(element, pageObject){
		window.requestAnimationFrame(function(){
					
			if (typeof element.attr('hidden') !=='undefined'){
				element.attr('revealing',"");
			} else if (typeof element.attr('hidden') == 'undefined' && typeof element.attr('hiding') == 'undefined'  && typeof element.attr('visible') == 'undefined'){
				//if page is not yet have any attributes
				//Add creating attribute ALMOST immedaitely for smooth appearance
				setTimeout(function(){
					element.attr('creating',"");
				});
			}

			//immediately remove block hidden
			element.removeAttr('hidden');
			element.removeAttr('hiding');
						
			//Set to fully visible after 500ms delay
			setTimeout(function(){
				if (typeof element.attr('deleting') !=='undefined')
					return;
				element.removeAttr('hidden');
				element.removeAttr('hiding');	
				element.removeAttr('revealing');
				element.removeAttr('creating');

				if (typeof element.attr('visible') == 'undefined'){
					tryCall(pageObject,pageObject.onVisible);
				}
				element.attr('visible','');

				
			},transitionTime);	
		});
		
	}

	/**
	 * Hide particular page DOM element
	 * @param {JQuery<HTMLElement>} element - page element to hide
	 * @param {function(JQuery<HTMLElement>)} [callback] - fired when hiding is complete
	 * @param {boolean} [isDeleting] - true if page is being deleted
	 */
	function hidePageElement(element,callback,isDeleting){
		isDeleting = isDeleting || false;
		var isHidden = typeof element.attr('hidden') !== 'undefined';

		if (typeof element.attr('deleting') !== 'undefined')
			return;
		function doHideElem(){
			window.requestAnimationFrame(function(){
				element.removeAttr('deleting');
				element.removeAttr('hiding');
				element.attr('hidden','');
				if (typeof callback=='function')
					callback(element);
				else{	
					//element.css('display','none');
					//console.log("Hide Element",element[0].id);
				}
			})
		}
		if(isHidden){
			doHideElem();
		}else{
			element.removeAttr('visible');
			if (isDeleting)
				element.attr('deleting',"");
			else
				element.attr('hiding',"");
			setTimeout(function(){
				doHideElem();
			},isDeleting ? transitionTime : transitionTime + 100);	//hiding takes 100 ms longer than deleting
		}
	}

	//add ONE listener that will fire onResize on all pages;
	$(window).on('resize', function(ev){
		for(var i=0 ; i<stack.length;i++){
			recalcContentHeight(stack[i].element);
			tryCall(stack[i].page, stack[i].page.onResize);
		}
	});

	$(document).on("backbutton", function(e) {
		//move back or notify about last page
		if (self.back()===null){
			self.onRootPageBackPressed(currentFrame().name);
		}
	});

	/**
	 * Callback fired when Back button is clicked on LAST page of the app 
	 * @param {string} name
	 */
	this.onRootPageBackPressed = function (name){}
	/**
	 * Callback fired on page forward
	 * @param {string} name 
	 */
	this.onPageNavigateTo = function (name){}
	/**
	 * Callback fired when page is navigated "back" to
	 * @param {string} name 
	 */
	this.onPageNavigateBack = function (name){}
}
