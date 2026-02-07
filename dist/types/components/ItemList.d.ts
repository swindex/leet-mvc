import { BaseComponent } from "./BaseComponent";
/**
 * Buffered ItemList component
 * to be used as [directive] provider for the Binder engine
 * this.listComp = new ItemList();
 * this.listComp.displayBufferItems = 50;
 * this.listComp.items = ["item 1","item 2","item 3"];
 * this.listComp.onItemClicked = (item, index)=>{
 * 		alert('item was clicked!');
 * }
 * ...
 * page.template = '<div [directive]="this.listComp">'
 */
export declare class ItemList extends BaseComponent {
    constructor();
    /**
     * Set Items array
     */
    set items(itemsList: any);
    /**
     * Get items array
     */
    get items(): any;
    /**
     * Fires when an item is clicked
     * @param {*} item
     */
    onItemClicked(item: any, index: any): void;
    /**
     * Event handler fires when scrolled
     * @param {number} top - current scroll offset
     * @param {number} max - maximum scroll offset
     */
    onScroll(top: any, max: any): void;
    onBeforeUpdate(): void;
    /**
     * Set items for buffered rendering. Recommended instead of accessing
     * @param {any[]} itemsList
     */
    setList(itemsList: any): void;
    addItem(item: any): void;
    /**
     * Add items for buffered rendering. Recommended for
     * @param {any[]} items
     */
    addItems(items: any): void;
    scrollTotop(): void;
    scrollToBottom(): void;
    onInit(container: any): void;
}
