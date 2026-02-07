import { BasePage } from "./../BasePage";
import './Toast.scss';
/**
 * Show toast popup
 * @param {string} message - text message to display
 * @param {number} [timeout] - timout - default 3000 ms
 * @param {function():any} [onClosed] - callback fied when toast is closed
 * @param {'top'|'bottom'|'middle'} [location] - default bottom
 */
export declare function Toast(message: any, timeout: any, onClosed: any, location?: string): any;
export declare class ToastPage extends BasePage {
    constructor();
    show(timeout: any): void;
    onDestroy(): void;
    /**
       * ***Override***
       */
    onClosed(): void;
    get template(): string;
}
