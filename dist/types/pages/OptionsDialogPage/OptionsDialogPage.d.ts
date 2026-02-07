import './OptionsDialogPage.scss';
import { DialogPage } from "../DialogPage/DialogPage";
export declare class OptionsDialogPage extends DialogPage {
    constructor();
    /**
       * Set to true to seelct multiple items
       * @param {boolean} value
       */
    set multiple(value: any);
    /**
       * @return {boolean}
       */
    get multiple(): any;
    onLoaded(): void;
    onBackdropClicked(): void;
    /** ***Private*** Item click handler*/
    _onItemClicked(item: any, index: any): void;
    onCancelClicked(): boolean;
    /**
       * ***Private***
       */
    _onOkClicked(): void;
    getSelectedItems(): any[] | Record<string, any>;
    /**
       * ***Override***
       * Callback returns the array of selected items
       * @param {{[x: string]: any,image?:string,icon?:string,title:string}[]}} selectedItems
       * @return {void|false}
       */
    onOkClicked(selectedItems: any): void;
    /**
       * ***Overwrite***
       * Callback notifying an item was selected
       * Return false to cancel any automatic action
       * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item
       * @param {number} index
       * @return {void|false}
       */
    onItemClicked(item: any, index: any): void;
    /**
       * Callback Returns true if the passed item is to be marker 'selected' in the list
       * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item
       * @return {string}
       */
    getIcon(item: any): any;
    /**
       * Callback Returns true if the passed item is to be marker 'selected' in the list
       * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item
       * @return {string}
       */
    getImage(item: any): any;
    /**
       * Callback Returns true if the passed item is to be marker 'selected' in the list
       * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item
       * @return {boolean}
       */
    isSelectedItem(item: any): any;
    /**
       * Callback Returns true if the passed item is to be marked 'disabled' in the list
       * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item
       * @return {boolean}
       */
    isDisabledItem(item: any): any;
}
