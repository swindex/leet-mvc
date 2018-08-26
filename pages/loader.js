// @ts-ignore
import * as template from '../views/Loader.html';
import "../scss/loader.scss";
/**
 * @constructor {Loader}
 */
export function Loader (){
	function Loader(){
		/** @type {Loader} */
		var self = this
		this._loaderSelector= null;
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
			this._loaderContainer = container
			return self;
		}
		/**
		 * Pass false to make backdrop transparent
		 * @param {boolean} isVisible 
		 */
		this.backdrop = function(isVisible){
			is_backdrop = isVisible;
			return self;
		}

		/**
		 * Set loader timeout
		* @param {number} [timeout] - timeout ms. Loader will be closed automatically. 60000 (60s) is default
		* @param {function(number)} [onTimeout] - callback to execute on timeout. the current timeout number is passed as argument
		* @returns {Loader}
		*/
		this.timeout = function(timeout, onTimeout){
			this._loaderTimeout = timeout;
			if (typeof onTimeout ==='function')
				this._loaderTimeoutCallback = onTimeout;
			return self;
		}

		/**
		 * @param {string} [text] - text to show. By default Loading ... will be displayed
		 * @returns {Loader}
		 */
		this.show= function(text){
			this.hide();

			this._loaderContainer = this._loaderContainer || 'body';
			this._loaderTimeout = this._loaderTimeout || 0;
			this._loaderIsTimedOut = false;
			this._loaderSelector = $(template);
			if (!empty(text))
				this._loaderSelector.find('.loader-message').text(text);
			if (!is_backdrop)	
				this._loaderSelector.css('background-color','rgba(0,0,0,0)');
			//append loader to container
			$(this._loaderContainer).append(this._loaderSelector);

			if (this._loaderTimeout > 0){
				setTimeout(function(){
						if (!self._loaderSelector)
							return;
						self.hide();
						self._loaderIsTimedOut = true;
						if (typeof self._loaderTimeoutCallback ==='function')
							self._loaderTimeoutCallback(self._loaderTimeout);
					}, this._loaderTimeout);
			}	
			return self;
		}
		/**
		 * Start loader without showing anything
		 * @returns {Loader}
		 */
		this.start= function(){
			this.hide();

			this._loaderContainer = this._loaderContainer || 'body';
			this._loaderTimeout = this._loaderTimeout || 0;

			//this._loaderSelector = $(template);
			//if (!empty(text))
			//	this._loaderSelector.find('.loader-message').text(text);
			//append loader to container
			//$(this._loaderContainer).append(this._loaderSelector);

			if (this._loaderTimeout > 0){
				setTimeout(function(){
						if (!self._loaderSelector)
							return;
						self.hide();
						self._loaderIsTimedOut = true;
						if (typeof self._loaderTimeoutCallback ==='function')
							self._loaderTimeoutCallback(self._loaderTimeout);
					}, this._loaderTimeout);
			}	
			return self;
		}
		/**
		 * Return true if timeout was called
		 * @returns {boolean}
		 */
		this.isTimedOut = function(){
			return self._loaderIsTimedOut;
		}

		/**
		 * Try to Hide the Loader. Returns false if the loader has timed out.
		 * @returns {boolean}
		 */
		this.hide = function(){
			if (this._loaderIsTimedOut) 
				return false;

			if (this._loaderSelector)
				this._loaderSelector.remove();
			this._loaderSelector= null;


			this._loaderIsTimedOut = false;

			return true;
		}
	}	
	return new Loader();	
}
