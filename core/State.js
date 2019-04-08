import { GUID, tryCall } from "./helpers";
import { Objects } from "./Objects";


export function State(){
	/** @type {{[uid:string]:any}} */
	var Queue = {};
	var Data = null;

	/**
	 * Add a callback to queue
	 * @param {function()} callback 
	 * @return {function()}
	 */
	function listen(callback){
		//modify callback by adding index to it
		callback['_CallbackQueueGUID'] = GUID()
		Queue[callback['_CallbackQueueGUID']] = callback;
		tryCall(null, callback, Data);
		return callback;
	}
	/**
	 * Remove callback from Queue
	 * @param {function()} callback 
	 */
	function remove(callback){
		//use index to remove the callback we created
		var UID = callback['_CallbackQueueGUID'];
		if (Queue[UID])
			delete	Queue[UID];
		else{
			console.log ('CallbackQueue: unable to .remove callback:',callback);
		}
	}
	/**
	 * Call all callbacks
	 * @param {*} data
	 */
	function set(data){
		Data = Objects.copy(data);
		//execute callbacks in non-blocking fassion
		setTimeout(function () {
			Objects.forEach(Queue,(obj)=>{
				//each getter will get independent object
				tryCall(null, obj, Objects.copy(data));
			});	
		},0);	
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