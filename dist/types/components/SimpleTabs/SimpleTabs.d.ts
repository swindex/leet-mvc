import { BaseComponent } from "./../BaseComponent";
import './SimpleTabs.scss';
/**
 * Simple tabs directive.
 */
export declare class SimpleTabs extends BaseComponent {
    constructor();
    /**
     * ***Override*** Called when tab is changed
     * @param {string} tabLabel
     */
    onTabChanged(tabLabel: any): void;
    _unSelectAll(): void;
    /** @param {HTMLElement} elem */
    _getTabLabel(elem: any): string | void;
    _getTab(target: any): import("../../core/DOM").DOMInstance;
    _select(target: any): void;
    select(forLabel: any): void;
    setTabVisibility(forLabel: any, isVisible: any): void;
    onInit(container: any): void;
}
