import { BaseComponent } from "../BaseComponent";
import './SwiperTabs.scss';
import 'swiper/swiper.scss';
/**
 * @param {{navButtons?: true}} [options]
 */
export declare class SwiperTabs extends BaseComponent {
    constructor();
    /**
     * ***Override*** called when page is changed
     * @param {BasePage} page - page opject
     * @param {number} index - page index
     */
    onTabChanged(page: any, index: any): void;
    /**
     * Change the displayed tab
     * @param {number} index
     * @param {number} [speed] - default
     * @param {boolean} [triggerEvents] - default true
     */
    changeTab(index: any, speed: any, triggerEvents: any): void;
    addPage(PageConstructor: any, args: any): any;
    /**
     * Call to destroy container and remove all pages
     */
    onDestroy(): void;
    /**
     * Remove all pages
     */
    removeAllPages(): void;
    /**
     * Remove a page from internal stack
     * @param {*} pageInstance
     */
    removePage(pageInstance: any): void;
    onInit(container: any): void;
}
