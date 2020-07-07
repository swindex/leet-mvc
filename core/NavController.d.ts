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
    setRoot<T>(PageObject: T): T;
		setRoot<T>(PageClass: { new (x, ...args): T }, ...args): T;
    setRoot<T>(PageClass: Promise<{ new (x, ...args): T }>, ...args): T;

    push<T>(PageObject: T): T;
    push<T>(PageClass: { new (x, ...args): T }, ...args): T;
    push<T>(PageClass: Promise<{ new (x, ...args): T }>, ...args): Promise<T>;

    pushInto<T>(container: HTMLElement, PageClass: { new (x, ...args): T }, ...args): T;
		onPageNavigateTo(pageName: string, pageObject: any): void;
    onPageNavigateBack(pageName: string, pageObject: any): void;
    onDestroyPage(pageName: string, pageObject: any): void;
		onPageCreated(PageInstance: any):void;
		onRootPageBackPressed(): void;
		getPages(): PageFrame[];
		destroy():void;
	};
	
}

export = NavControllerModule;