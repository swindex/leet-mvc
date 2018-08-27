declare namespace SwiperTabsModule{
	class SwiperTabs extends SwiperTabs {
		addPage<T>(PageClass: { new (x, ...args): T }, ...args): T;
		init(container: HTMLElement): void;
		onTabChanged(page: object,index: index): void;
		swiper: Swiper;
	};
	
}

export = SwiperTabsModule;
