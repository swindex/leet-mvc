import { tryCall } from "./helpers";
import { Objects } from "./Objects";

/**
 * This factory function allows to create shared state across multiple modules with listeners, getters and emmitters
 * @param {*} data 
 */
export function State2(data){
	/** @type {any[]} */
	var Queue = [];
	var Data = Objects.copy(data);
	var _error;
	var index = 0;
	/** @type {boolean} */
	var isRunning = null;
	/** @type {boolean} */
	var isSet = null;
	/**
	 * Add a callback to queue
	 * @return {{index:number, remove:function():void, onSet: function():void, onError: function():void, onStatus: function():void}}
	 */
	function add(){
		index++;
		Queue[index] = {};

		var i = index;
		var listener = {
			index:i,
			remove:function(){
				removeIndex(i);
				delete this.index;
				delete this.remove;
			},
			onSet: function(callback){
				Queue[this.index]._onSet = callback;
				if (isSet) {
					tryCall(null, callback, Objects.copy(Data));
				}
				return listener;
			},
			onError: function(callback){
				Queue[this.index]._onError = callback;
				if (_error) {
					tryCall(null, callback, Objects.copy(_error));
				}
				return this;
			},
			onStatus: function(callback){
				Queue[this.index]._onStatus = callback;
				tryCall(null, callback, isRunning);
				return this;
			},
			
		};
		listener.remove.bind(listener);
		listener.onSet.bind(listener);
		listener.onError.bind(listener);
		listener.onStatus.bind(listener);
		return listener;
	}
	
	/**
	 * Remove callback from Queue
	 * @param {{index:number, remove:function():void, onSet: function():void, onError: function():void, onStatus: function():void}} listener 
	 * @return {boolean}
	 */
	function remove(listener){
		if (listener && listener.index){
			removeIndex(listener.index);
			delete listener.index;
			delete listener.remove;
			delete listener.onSet;
			delete listener.onError;
			delete listener.onStatus;
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
	function setData(data){
		isSet = data === undefined ? false : true;
		Data = Objects.copy(data);
		//execute callbacks in Queue
		for (var i in Queue){
			var callback = Queue[i]._onSet;
			if (callback){
				try {
					tryCall(null, callback, Objects.copy(data));
				} catch (ex) {
					console.warn(ex);
				}
			}
		}
		setStatus(false);
	}
	/**
	 * Call all callbacks
	 * @param {*} data
	 */
	function setError(data){
		_error = Objects.copy(data);
		//execute callbacks in Queue
		for (var i in Queue){
			var callback = Queue[i]._onError;
			if (callback){
				try {
					tryCall(null, callback, Objects.copy(data));
				} catch (ex) {
					console.warn(ex);
				}
			}
		}
		setStatus(false);
	}

	/**
	 * 
	 * @param {boolean} newStatus 
	 */
	function setStatus( newStatus ){
		if (isRunning === newStatus){
			return;
		}
		isRunning = newStatus;
		for (var i in Queue){
			var callback = Queue[i]._onStatus;
			if (callback){
				tryCall(null, callback, isRunning);
			}
		}
	}

	var Me = {
		add: add,
		get error(){
			return _error;
		},
		set error(val){
			setError(val);
		},
		get isRunning(){
			return isRunning;
		},
		set isRunning(val){
			setStatus(val);
		},
		get data(){
			return Data;
		},
		set data(data){
			setData(data);
		},
		remove: remove,
		setData: setData,
		setError: setError,
		setRunning: setStatus
	};
	return Me;
}