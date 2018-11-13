import { NavController } from "leet-mvc/core/NavController";

declare namespace SwiperTabsModule{
	class SwiperTabs extends SwiperTabs {
		Nav: NavController;
		addPage<T>(PageClass: { new (x, ...args): T }, ...args): T;
		removePage(pageInstance: any):void;
		removeAllPages():void;
		init(container: HTMLElement): void;
		onTabChanged(page: object,index: index): void;
		swiper: Swiper;
	};
	
}

export = SwiperTabsModule;
