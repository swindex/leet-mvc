import './ActionSheetPage.scss';
import { BasePage } from './../BasePage';
/**
 * @param {HTMLElement} container
 */
export declare class ActionSheetPage extends BasePage {
    constructor();
    /**
       * @param {*} d
       */
    slideDirection(d: any): void;
    onBackdropClicked(): void;
    _onItemClicked(item: any): void;
    onItemClicked(item: any): void;
    /**
       * Callback Returns true if the passed item is to be marker 'selected' in the list
       * @param {*} item
       * @return {boolean}
       */
    isSelectedItem(item: any): boolean;
    get template(): string;
}
