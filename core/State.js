import { tryCall } from "./helpers";
import { Objects } from "./Objects";

/**
 * This factory function allows to create shared state across multiple modules with listeners, getters and emmitters
 * @param {*} data 
 */
export function State(data){
	/** @type {any[]} */
	var Queue = [];
	var Data = Objects.copy(data);
	var index = 0;

	/**
	 * Add a callback to queue
	 * @param {function():void} callback 
	 * @return {{index:number, remove:function():void}}
	 */
	function listen(callback){
		index++;
		Queue[index] = callback;
		var listener = {
			index:index,
			remove:function(){
				removeIndex(index);
				delete this.index;
				delete this.remove;
			}
		};
		listener.remove.bind(listener);
		return listener;
	}
	/**
	 * Remove callback from Queue
	 * @param {{index:number, remove:function():void}} listener 
	 * @return {boolean}
	 */
	function remove(listener){
		if (listener && listener.index){
			removeIndex(listener.index);
			delete listener.index;
			delete listener.remove;
			
			return true;
		}
		console.log ('CallbackQueue: unable to .remove callback:',index);
		return false;
	}
	/**
	 * Remove callback from Queue
	 * @param {number} index 
	 */
	function removeIndex(index){
		//use index to remove the callback we created
		if (Queue[index]){
			delete	Queue[index];
			return true;
		} 
		console.log ('CallbackQueue: unable to .remove callback:',index);
		return false;
	}
	/**
	 * Call all callbacks
	 * @param {*} data
	 */
	function set(data){
		Data = Objects.copy(data);
		//execute callbacks in Queue
		for (var i in Queue){
			var callback = Queue[i];
			if (callback){
				tryCall(null, callback, Objects.copy(data));
			}
		}
	}

	var self = {
		get: function(){return Data;},
		get data(){
			return Data;
		},
		listen: listen,
		remove: remove,
		set: set,
	}
	return self;
}