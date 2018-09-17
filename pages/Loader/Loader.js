// @ts-ignore
import * as template from './Loader.html';
import "./Loader.scss";
import { Translate } from 'leet-mvc/core/Translate';
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
			self._loaderContainer = container
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
			self._loaderTimeout = timeout;
			if (typeof onTimeout ==='function')
				self._loaderTimeoutCallback = onTimeout;
			return self;
		}

		/**
		 * @param {string} [text] - text to show. By default Loading ... will be displayed
		 * @returns {Loader}
		 */
		this.show= function(text){
			self.hide();

			text = text || Translate("Loading ...")

			self._loaderContainer = self._loaderContainer || 'body';
			self._loaderTimeout = self._loaderTimeout || 0;
			self._loaderIsTimedOut = false;
			self._loaderSelector = $(template);
			if (!empty(text))
				self._loaderSelector.find('.loader-message').text(text);
			if (!is_backdrop)	
				self._loaderSelector.css('background-color','rgba(0,0,0,0)');
			//append loader to container
			$(self._loaderContainer).append(self._loaderSelector);

			if (self._loaderTimeout > 0){
				setTimeout(function(){
						if (!self._loaderSelector)
							return;
						self.hide();
						self._loaderIsTimedOut = true;
						if (typeof self._loaderTimeoutCallback ==='function')
							self._loaderTimeoutCallback(self._loaderTimeout);
					}, self._loaderTimeout);
			}	
			return self;
		}
		/**
		 * Start loader without showing anything
		 * @returns {Loader}
		 */
		this.start= function(){
			self.hide();

			self._loaderContainer = self._loaderContainer || 'body';
			self._loaderTimeout = self._loaderTimeout || 0;

			//this._loaderSelector = $(template);
			//if (!empty(text))
			//	this._loaderSelector.find('.loader-message').text(text);
			//append loader to container
			//$(this._loaderContainer).append(this._loaderSelector);

			if (self._loaderTimeout > 0){
				setTimeout(function(){
						if (!self._loaderSelector)
							return;
						self.hide();
						self._loaderIsTimedOut = true;
						if (typeof self._loaderTimeoutCallback ==='function')
							self._loaderTimeoutCallback(self._loaderTimeout);
					}, self._loaderTimeout);
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
			if (self._loaderIsTimedOut) 
				return false;

			if (self._loaderSelector)
				self._loaderSelector.remove();
			self._loaderSelector= null;


			self._loaderIsTimedOut = false;

			return true;
		}
	}	
	return new Loader();	
}
