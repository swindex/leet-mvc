import './MenuPage.scss';
import { BasePage } from "./../BasePage";
/**
 * @param {HTMLElement} container
 */
export declare class MenuPage extends BasePage {
    constructor(position: any);
    _onItemClicked(item: any, index: any): void;
    onItemClicked(item: any, index: any): void;
    onDestroy(): void;
    /**
       * Check if the item is selected
       * @param {{action:any,label:string}} item
       * @return {boolean}
       */
    isSelected(item: any): boolean;
    onVisible(): void;
    onInit(): void;
    onBackdropClicked(): void;
    /** @override */
    onLogoClicked($event: any): void;
    _onLogoClicked($event: any): void;
    get template(): string;
}
