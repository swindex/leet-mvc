// @ts-ignore
import "./Loader.scss";
import { Translate } from './../../core/Translate';

import { BasePage } from './../BasePage';

import { Injector } from './../../core/Injector';



export function Loader (){
  function Loader(){
    /** @type {Loader} */
    var self = this;
    this.loaderInstance = null;
    this._loaderContainer= null;
    this._loaderTimeout= 30000;
    this._loaderTimeoutCallback= null;
    this._loaderIsTimedOut= false;
    var is_backdrop = true;
    /**
		 * Attach Loader so a specific element. 
		 * @param {string|HTMLElement|JQuery<HTMLElement>} [container] - container to attach loader to. By default will be attached to body.
		 * @returns {Loader}
		 */
    this.container= function(container){
      self._loaderContainer = container;
      return self;
    };
    /**
		 * Pass false to make backdrop transparent
		 * @param {boolean} isVisible 
		 */
    this.backdrop = function(isVisible){
      is_backdrop = isVisible;
      return self;
    };

    /**
		 * Set loader timeout
		 * @param {number} [timeout] - timeout ms. Loader will be closed automatically. 60000 (60s) is default
		 * @param {function(number)} [onTimeout] - callback to execute on timeout. the current timeout number is passed as argument
		 * @returns {Loader}
		 */
    this.timeout = function(timeout, onTimeout){
      self._loaderTimeout = timeout;
      if (typeof onTimeout ==='function')
        self._loaderTimeoutCallback = onTimeout;
      return self;
    };

    /**
		 * @param {string} [text] - text to show. By default Loading ... will be displayed
		 * @returns {Loader}
		 */
    this.show= function(text){
			
      if (!self._loaderContainer)
        self.loaderInstance = Injector.Nav.push(LoaderPage);
      else 	
        self.loaderInstance = Injector.Nav.pushInto(self._loaderContainer, LoaderPage);

      self.loaderInstance.text = text || Translate("Loading ...");

      self._loaderTimeout = self._loaderTimeout || 0;
      self._loaderIsTimedOut = false;
      if (self._loaderTimeout > 0){
        setTimeout(function(){
          if (!self.loaderInstance)
            return;
          self.hide();
          self._loaderIsTimedOut = true;
          if (typeof self._loaderTimeoutCallback ==='function')
            self._loaderTimeoutCallback(self._loaderTimeout);
        }, self._loaderTimeout);
      }	
			
      return self;
    };
    /**
		 * Start loader without showing anything
		 * @returns {Loader}
		 */
    this.start= function(){
      self._loaderContainer = self._loaderContainer || 'body';
      self._loaderTimeout = self._loaderTimeout || 0;

      if (self._loaderTimeout > 0){
        setTimeout(function(){
          if (!self.loaderInstance)
            return;
          self.hide();
          self._loaderIsTimedOut = true;
          if (typeof self._loaderTimeoutCallback ==='function')
            self._loaderTimeoutCallback(self._loaderTimeout);
        }, self._loaderTimeout);
      }	
      return self;
    };
    /**
		 * Return true if timeout was called
		 * @returns {boolean}
		 */
    this.isTimedOut = function(){
      return self._loaderIsTimedOut;
    };

    /**
		 * Try to Hide the Loader. Returns false if the loader has timed out.
		 * @returns {boolean}
		 */
    this.hide = function(){
      if (self._loaderIsTimedOut) 
        return false;

      self.loaderInstance.destroy();
      self.loaderInstance = null;


      self._loaderIsTimedOut = false;

      return true;
    };
  }	
  return new Loader();	
}

class LoaderPage extends BasePage {
  constructor(){
    super();

    this.text = "Loading ...";
  }
  get template(){
    return `<div class="loader-screen" [style]="this.style" [attribute]="{root: this.isRoot, hidden:this.isHidden,visible:this.isVisible,showing:this.isShowing,hiding:this.isHiding,creating:this.isCreating,deleting:this.isDeleting}">
<div class="loader-box">
<div class="loader-spinner"></div>	
<div class="loader-message" bind="Translate(this.text)">Loading ...</div>	
</div>
</div>`;
  }
}
LoaderPage.visibleParent = true;