import { BaseComponent } from "../../components/BaseComponent";
export declare class MultiSelect extends BaseComponent {
    constructor();
    onClick(): void;
    /**
     * ***Override***
     * @param {*} ev
     */
    onChange(ev: any): void;
    getDisplayText(): any;
}
