declare namespace NavControllerModule{
	class PageFrame{
		name: string;
		element: JQuery<HTMLElement>;
		page: any; 
	}

	class NavController  {
		remove(PageInstance: any);
		removeAll(): void;
		back():void;
		setContainer(container: HTMLElement|DocumentFragment, listenToBackButton?: boolean): void;
		setRoot<T>(PageClass: { new (x, ...args): T }, ...args): T;
		push<T>(PageClass: { new (x, ...args): T }, ...args): T;
		onPageNavigateTo(pageName: string): void;
		onPageCreated(PageInstance: any):void;
		onRootPageBackPressed(): void;
		getPages(): PageFrame[];
		destroy():void;
	};
	
}

export = NavControllerModule;