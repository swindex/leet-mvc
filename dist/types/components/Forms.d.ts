import { BaseComponent } from "./BaseComponent";
export declare class Forms extends BaseComponent {
    /**
     * Forms Directive. Generate forms from JSON data
     * @param {FieldTemplate[]} formTemplate
     * @param {*} [data]
     * @param {*} [errors]
     * @param {{nestedData?:boolean, formClass?:string, fieldClass?:string}} [options]
     */
    constructor(formTemplate: any, data: any, errors: any, options: any);
    setDataValuesFromFields(): void;
    updateTemplate(formTemplate: any): void;
    onChangeChange(value: any): void;
    onInputChange(value: any): void;
    onClickChange(value: any): void;
    /**
     * @param {HTMLInputElementChangeEvent} event
     */
    onChange(event: any): void;
    /**
     * @param {HTMLInputElementChangeEvent} event
     */
    onInput(event: any): void;
    /**
     * @param {HTMLInputElementChangeEvent} event
     */
    onClick(event: any): void;
    /**
     * @param {HTMLElementMouseEvent} event
     */
    onButtonClick(event: any): void;
    _formatSplitDateField(evt: any, name: any, isTime: any): void;
    _formatPhoneNumber(evt: any): void;
    /**
     *
     * @param {FieldTemplate[]} formTemplate
     */
    renderArray(formTemplate: any, parentPath: any): string;
    /**
     *
     * @param {FieldTemplate} el
     * @param {string} parentPath
     */
    render_field(el: any, parentPath: any): any;
    assertValidateRuleHas(el: any, mustHave: any): void;
    /**
     *
     * @param {FieldTemplate} el
     * @param {string} [parentPath]
     */
    addForm(el: any, parentPath: any): string;
    /**
     *
     * @param {FieldTemplate} el
     * @param {string} [parentPath]
     */
    addArray(el: any, parentPath: any): string;
    /**
     * @returns {{[key:string]:any}}
     */
    getVisibleData(): any;
    /**
     *
     * @param {FieldTemplate} el
     * @param {string} childrenHTML
     */
    renderArrayHTML(el: any, childrenHTML: any): string;
    renderFormHTML(el: any, childrenHTML: any): string;
    renderFieldGroupHTML(el: any, elHTML: any, noTitle?: boolean, noErrorHint?: boolean): string;
    renderSelectGroupHTML(el: any, elHTML: any): string;
    getPropertyByPath(object: any, path: any): any;
    getIsVisible(_name: any): boolean;
    getClassName(_name: any): string;
    getError(_name: any): any;
    /**
     *
     * @param {FieldTemplate} el
     * @param {KeyValuePair} [override]
     */
    addInput(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addFile(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addPassword(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addTextArea(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addCheckSquare(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addCheckRound(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addToggle(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addRadio(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    * @param {KeyValuePair} [override]
    */
    addSelect(el: any, override: any, parentPath: any): string;
    _onSelectBoxChanged(_name: any): void;
    /**
    *
    * @param {FieldTemplate} el
    */
    addTitle(el: any): string;
    /**
    *
    * @param {FieldTemplate} el
    */
    addInfo(el: any): string;
    /**
    *
    * @param {FieldTemplate} el
    */
    addItemInfo(el: any, itemIndex: any): string;
    stopEvent($event: any): void;
    /**
    *
    * @param {FieldTemplate} el
    */
    addErrorHint(el: any): string;
    showInfoText(name: any, itemIndex?: any): void;
    /**
    * Split form name from property name
    * @param {string} name
    */
    refactorAttrName(name: any): any;
    /**
    *
    * @param {FieldTemplate} el
    */
    addLabel(el: any, override: any): string;
    /**
    *
    * @param {FieldTemplate} el
    */
    addHtml(el: any): string;
    /**
    *
    * @param {FieldTemplate} el
    */
    addLink(el: any): string;
    /**
    *
    * @param {FieldTemplate} el
    */
    addButton(el: any): string;
    /**
    *
    * @param {FieldTemplate} el
    */
    addButtons(el: any): string;
    togglePasswordType(name: any): void;
    getFieldAttributes(_name: any): any;
    generateAttributes(opt: any): string;
    /**
    *
    * @param {Event} event
    */
    transferEventToChildInput(event: any): void;
    trimDisplayFileName(fileName: any): string;
    getFileFieldFileName(name: any): string;
    onFileFieldChanged(name: any, event: any): void;
}
