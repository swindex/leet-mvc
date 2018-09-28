declare namespace NavControllerModule{
	class PageFrame{
		name: string;
		element: JQuery<HTMLElement>;
		page: any; 
	}

	class NavController  {
		remove(PageInstance: any);
		back():void;
		setContainer(container: HTMLElement): void;
		setRoot<T>(PageClass: { new (x, ...args): T }, ...args): T;
		push<T>(PageClass: { new (x, ...args): T }, ...args): T;
		onPageNavigateTo(pageName: string): void;
		onRootPageBackPressed(): void;
		getPages(): PageFrame[];
	};
	
}

export = NavControllerModule;