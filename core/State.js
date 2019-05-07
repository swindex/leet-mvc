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
	/** @type {boolean} */
	var isRunning = null;
	/** @type {boolean} */
	var isSet = null;
	/**
	 * Add a callback to queue
	 * @param {function():void} dataChanged 
	 * @param {function():void} statusChanged  
	 * @return {{index:number, remove:function():void}}
	 */
	function onChange(dataChanged, statusChanged){
		index++;
		Queue[index] = {dataChanged:dataChanged,statusChanged};

		var i = index;
		var listener = {
			index:i,
			remove:function(){
				removeIndex(i);
				delete this.index;
				delete this.remove;
			}
		};
		listener.remove.bind(listener);
		return listener;
	}
	/**
	 * Add a callback to queue AND cal the callback is already set!
	 * @param {function():void} dataChanged 
	 * @param {function():void} statusChanged  
	 * @return {{index:number, remove:function():void}}
	 */
	function onSet(dataChanged, statusChanged){
		
		if (isSet) {
			tryCall(null, dataChanged, Objects.copy(Data));
		}
		tryCall(null, statusChanged, isRunning);
		
		return onChange(dataChanged, statusChanged);
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
		isSet = data === undefined ? false : true;
		Data = Objects.copy(data);
		//execute callbacks in Queue
		for (var i in Queue){
			var callback = Queue[i].dataChanged;
			if (callback){
				try {
					tryCall(null, callback, Objects.copy(data));
				} catch (ex) {
					console.warn(ex);
				}
			}
		}
		setRunning(false);
	}

	/**
	 * 
	 * @param {boolean} newStatus 
	 */
	function setRunning( newStatus ){
		if (isRunning === newStatus){
			return;
		}
		isRunning = newStatus;
		for (var i in Queue){
			var callback = Queue[i].statusChanged;
			if (callback){
				tryCall(null, callback, isRunning);
			}
		}
	}

	var Me = {
		get isRunning(){return isRunning},
		set isRunning(val){setRunning(val)}, 
		get: function(){return Data;},
		get data(){
			return Data;
		},
		set data(data){
			set(data);
		},
		onChange: onChange,
		remove: remove,
		set: set,
		onSet: onSet,
	}
	return Me;
}