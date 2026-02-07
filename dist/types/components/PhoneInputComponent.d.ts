import { BaseComponent } from './BaseComponent';
export declare class PhoneInputComponent extends BaseComponent {
    constructor();
    /**
     *
     * @param {string|null} val
     */
    valueChange(val: any): void;
    onInit(): void;
    _onInput(ev: any): void;
    _onChange(ev: any): void;
    /** @override */
    onChange(ev: any): void;
    /** @override */
    onInput(ev: any): void;
    _formatAsPhoneNumber(): void;
    /**
     * Format phone number for display
     * @param {string} val
     */
    static FormatPhoneNumber(val: any): string;
    /**
     * Un-Format phone number for Data Transfer
     * @param {string} val
     */
    static UnFormatPhoneNumber(val: any): string;
    /**
     * Use PhoneInputComponent as input-phone for rendering in Forms for phone type field
     * @param {object} [attributes]
     */
    static Use(attributes: any): void;
}
