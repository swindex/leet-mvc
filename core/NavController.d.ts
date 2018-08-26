declare namespace NavControllerModule{
	class NavController  {
		remove(T: any);
		back():void;
		setContainer(container: HTMLElement): void;
		setRoot<T>(PageClass: { new (x, ...args): T }, ...args): T;
		push<T>(PageClass: { new (x, ...args): T }, ...args): T;
		destroy(PageInstance: any);
		onPageNavigateTo(pageName: string): void;
		onRootPageBackPressed(): void;
	};
	
}

export = NavControllerModule;