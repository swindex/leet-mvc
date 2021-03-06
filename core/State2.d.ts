declare namespace State2Namespace{ 
	class Listener{
		index:number;
    remove():boolean;
    destroy():boolean;
		onSet(callback:(data: T)=>void):Listener;
		onError(callback:(error: E)=>void):Listener;
		onStatus(callback:(isRunning: boolean)=>void):Listener;
	}
	declare function State2<T, E> (data?: T, error?: E): {
		/**
		 * Add State Listener to the queue. Make sure to use Remove method to prevent memory leaks
		 */
		newListener():{
			index:number;
      /** Remove a listener */
      //remove(func:Function):boolean;
      /** Remova all listeners from the queue and release resources*/
      destroy():boolean;

			/**
			 * Add on data set Callback
			 * @param callback 
			 */
			onSet(callback:(data: T)=>void):{
				index:number;
        remove():boolean;
        destroy():boolean;
				onSet(callback:(data: T)=>void):Listener;
				onError(callback:(error: E)=>void):Listener;
				onStatus(callback:(isRunning: boolean)=>void):Listener;
			};
			/**
			 * Add on error set Callback
			 * @param callback 
			 */
			onError(callback:(error: E)=>void):{
				index:number;
				remove():boolean;
        destroy():boolean;
				onSet(callback:(data: T)=>void):Listener;
				onError(callback:(error: E)=>void):Listener;
				onStatus(callback:(isRunning: boolean)=>void):Listener;
			};
			/**
			 * Add on status change Callback
			 * @param callback 
			 */
			onStatus(callback:(isRunning: boolean)=>void):{
				index:number;
				remove():boolean;
        destroy():boolean;
				onSet(callback:(data: T)=>void):Listener;
				onError(callback:(error: E)=>void):Listener;
				onStatus(callback:(isRunning: boolean)=>void):Listener;
			};
		}
		remove(listener:Listener):boolean;
    destroy():boolean;
		setData(data:T);
		setError(error:E);
		setRunning(status: boolean);

		data:T;
		error: E;
		isRunning:boolean;
	};
}

export = State2Namespace;