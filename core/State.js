import { tryCall } from "./helpers";
import { Objects } from "./Objects";


export function State(){
	/** @type {{[uid:string]:any}} */
	var Queue = [];
	var Data = null;
	var index = 0;

	/**
	 * Add a callback to queue
	 * @param {function():void} callback 
	 * @return {number}
	 */
	function listen(callback){
		index++;
		Queue[index] = callback;
		return index;
	}
	/**
	 * Remove callback from Queue
	 * @param {number} index 
	 */
	function remove(index){
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

	return {
		get: function(){return Data;},
		get data(){
			return Data;
		},
		listen: listen,
		remove: remove,
		set: set,
	}
}