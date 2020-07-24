import { BasePage } from "leet-mvc/pages/BasePage";

declare namespace NavControllerModule{
	class PageFrame{
		name: string;
		element: JQuery<HTMLElement>;
		page: BasePage; 
	}

	class NavController  {
    isLoadingRoot: boolean;
		remove(PageInstance: BasePage);
		removeAll(): void;
		back():void;
		setContainer(container: HTMLElement|DocumentFragment, listenToBackButton?: boolean): void;
    setRoot<T>(PageClass: { new (x, ...args): T }, ...args): T;
    setRoot<T>(PageClass: Promise<{ new (x, ...args): T }>, ...args): T;
    setRoot<T>(PageObject: T): T;
    push<T>(PageClass: { new (x, ...args): T }, ...args): T;
    push<T>(PageClass: Promise<{ new (x, ...args): T }>, ...args): Promise<T>;
    push<T>(PageObject: T): T;
    
    pushInto<T>(container: HTMLElement, PageClass: { new (x, ...args): T }, ...args): T;
		onPageNavigateTo(pageName: string, pageObject: BasePage): void;
    onPageNavigateBack(pageName: string, pageObject: BasePage): void;
    onDestroyPage(pageName: string, pageObject: BasePage, frameIndex: number): void;
		onPageCreated(PageInstance: BasePage):void;
		onRootPageBackPressed(): void;
		getPages(): PageFrame[];
		destroy():void;
	};
	
}

export = NavControllerModule;