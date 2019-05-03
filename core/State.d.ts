declare namespace StateNamespace{ 
	class Listener{
		index:number;
		remove():boolean
	}
	declare function State<T> (data?: T): {
		isRunning: boolean,
		onSet(dataChangedCallback:(data: T)=>void,statusChangedCallback?:(running: boolean)=>void):Listener;
		onChange(dataChangedCallback:(data: T)=>void,statusChangedCallback?:(running: boolean)=>void):Listener;
		remove(listener:Listener):boolean;
		set(data:T);
		get():T;
		data:T
	};
}

export = StateNamespace;