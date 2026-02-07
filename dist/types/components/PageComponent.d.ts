import { BaseComponent } from "./BaseComponent";
import Swiper from 'swiper';
import { NavController } from "./../core/NavController";
import { BasePage } from "./../pages/BasePage";
/**
 * @param {{navButtons?: true}} [options]
 */
export declare class PageComponent extends BaseComponent {
    tempContainer: DocumentFragment | null;
    pages: BasePage[];
    swiper: Swiper | null;
    Nav: NavController;
    constructor();
    addPage(PageConstructor: any, ...args: any[]): any;
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
    onInit(container: HTMLElement): void;
}
