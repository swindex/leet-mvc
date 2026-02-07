import { BasePage } from "../BasePage";
import './DialogPage.scss';
/**
 * Create an instance of the dialog page
 * @param {string} title
 * @param {'flexible'|'large'} [popupStyle]
 */
export declare function Dialog(title: any, popupStyle?: string): any;
export declare class DialogPage extends BasePage {
    constructor(title: any);
    onResize(windowSize: any): void;
    onButtonClicked(button_title: any): void;
    onClickedOutside(): void;
    render(): void;
    /**
     *
     * @param {FieldTemplate} fieldTemplate
     * @param {any} value
     * @returns
     */
    addField(fieldTemplate: any, value: any): this;
    addCheck(name: any, title: any, value: any, required: any, attrs?: any): this;
    addSelect(name: any, title: any, value: any, required: any, items: any, attrs?: any): this;
    addRadio(name: any, title: any, value: any, required: any, items: any, attrs?: any): this;
    addInput(name: any, title: any, type: any, value: any, required: any, attrs?: any): this;
    addDate(name: any, title: any, value: any, required: any, attrs?: any): this;
    addDateTime(name: any, title: any, value: any, required: any, attrs?: any): this;
    addTime(name: any, title: any, value: any, required: any, attrs?: any): this;
    addTextArea(name: any, title: any, value: any, required: any, attrs?: any): this;
    addText(name: any, title: any, value: any, required: any, attrs?: any): this;
    addLabel(title: any, value: any, attrs?: any): this;
    addLink(name: any, title: any, value: any, attrs?: any): this;
    addPassword(name: any, title: any, value: any, required: any, attrs?: any): this;
    removeField(name: any): void;
    addHtml(value: any, attrs?: any): this;
    addSplit(items: any): this;
    /**
       * Validate the content form
       */
    validate(): any;
    /**
       * Add Action Button to the dialog
       * @param {string} title
       * @param {null|function(DialogPage):any} callback - fired when button is clicked. Return false to stop dialog from closing
       */
    addActionButton(title: any, callback: any): this;
    get template(): string;
}
