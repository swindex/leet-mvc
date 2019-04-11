declare namespace StateNamespace{ 
	class Listener{
		index:number;
		remove():boolean
	}
	declare function State<T> (data?: T): {
		listen(callback:(data: T)=>void):Listener;
		remove(listener:Listener):boolean;
		set(data:T);
		get():T;
		data:T
	};
}

export = StateNamespace;