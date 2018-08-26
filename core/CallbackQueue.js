import { GUID } from "./helpers";
import { Objects } from "./Objects";


export function CallbackQueue(){
	/** @type {{[uid:string]:any}} */
	var OnAppraisalsRefreshedQueue = {};

	/**
	 * Add a callback to queue
	 * @param {function()} callback 
	 * @return {function()}
	 */
	this.add = function(callback){
		//modify callback by adding index to it
		callback['_CallbackQueueGUID'] = GUID()
		OnAppraisalsRefreshedQueue[callback['_CallbackQueueGUID']] = callback;
		return callback;
	}
	/**
	 * Remove callback from Queue
	 * @param {function()} callback 
	 */
	this.remove = function(callback){
		//use index to remove the callback we created
		var UID = callback['_CallbackQueueGUID'];
		if (OnAppraisalsRefreshedQueue[UID])
			delete	OnAppraisalsRefreshedQueue[UID];
		else{
			console.log ('CallbackQueue: unable to .remove callback:',callback);
		}
	}
	/**
	 * Call all callbacks
	 * @param {...any} [args]
	 */
	this.call = function(args){
		//execute callbacks in non-blocking fassion
		args = arguments;
		setTimeout(function () {
			Objects.forEach(OnAppraisalsRefreshedQueue,(obj)=>{
				obj.apply(this, args);
			});	
		},0);	
	}
}