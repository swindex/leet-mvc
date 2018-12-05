/**
 * DeBouncer module
 */
export var DeBouncer = {
	/**
	 * Run debounced function FIRST only ONCE per life of the debouncer
	 */
	onceFirst: function(func){
		var _executedOnce = false;
		return function(){
			var context = this;
			if (!_executedOnce && (_executedOnce = true)){
				if (typeof func !== 'function')
					arguments[0].apply(context);
				else
					func.apply(context,arguments);

			}
		}
	},
	/**
	 * Run debounced function LAST only ONCE per life of the debouncer
	 */
	onceLast:function(func){
		var _executedOnce = false;
		return function(){
			var context = this;
			if (!_executedOnce && (_executedOnce = true)){
				if (typeof func !== 'function')
					arguments[0].apply(context);
				else
					func.apply(context,arguments);

			}
		}
	},
	/**
	 * Run debounced function FIRST only ONCE per animation FRAME
	 */
	frameFirst: function(func){
		var firstQueue = 0;
		var firstQueueExecuted = false;
		return function(){
			var context = this;
			if (!firstQueueExecuted && (firstQueueExecuted = true)){
				if (typeof func !== 'function')
					arguments[0].apply(context);
				else
					func.apply(context, arguments);
			}
			firstQueue ++;
			window.requestAnimationFrame(function(){
				firstQueue--
				if (firstQueue==0){
					firstQueueExecuted = false;
				}
			})
		}
	},
	/**
	 * Run debounced function LAST only ONCE per animation FRAME
	 */
	frameLast: function(func){
		var lastQueue=0;
		return function(){
			lastQueue ++;
			var context = this;
			var args = arguments;
			window.requestAnimationFrame(function(){
				lastQueue--;
				if (lastQueue==0){
					if (typeof func !== 'function')
						args[0].apply(context);
					else
						func.apply(context, args);
				}
			})
		}
	},
	/**
	 * Run debounced function FIRST only ONCE per TIMOUT
	 */
	timeoutFirst: function(timeoutMs, func){
			var timeout;
			return function(){
				var context = this;

				if (timeout){
					clearTimeout(timeout);
				}else{
					if (typeof func !== 'function')
						arguments[0].apply(context);
					else
						func.apply(context, arguments);
				}
				timeout = setTimeout(function(){
					clearTimeout(timeout)
					timeout= null;
				},timeoutMs);
			}
	},
	/**
	 * Run debounced function LAST only ONCE per TIMOUT
	 */
	timeoutLast: function(timeoutMs, func){
		return (function(){
			var timeout;
			return function(){
				var context = this;
				var args = arguments;
				if (timeout){
					clearTimeout(timeout);
					timeout = null;
				}
				timeout = setTimeout(function(){
					if (typeof func !== 'function')
						args[0].apply(context);
					else
						func.apply(context, args);
				},timeoutMs);
			}
		})();
	}
}