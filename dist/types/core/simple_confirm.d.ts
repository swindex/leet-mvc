/**
 * Show "Confirm" dialog with custom buttons
 */
export declare const ConfirmButtons: (prompt: string, title?: string, buttons?: {
    [button_name: string]: () => any;
}) => void;
/**
 * Show simple Confirm Box
 */
export declare const Confirm: (prompt: string, onConfirm?: () => void, title?: string) => void;
/**
 * Show simple Confirm Box (danger variant - Yes button first)
 */
export declare const ConfirmDanger: (prompt: string, onConfirm?: () => void, title?: string) => void;
/**
 * Show simple Prompt Box
 * @param prompt - The prompt message
 * @param onConfirm - Callback with the input value
 * @param title - dialog title
 * @param value - dialog initial value
 * @param validateRule - validate rule like 'required|min:10|max:50|number'
 * @param type - input type. Default - "text"
 */
export declare const Prompt: (prompt: string, onConfirm?: (value: string | number) => void, title?: string, value?: string, validateRule?: true | string, type?: string) => void;
/**
 * Show simple Alert box
 */
export declare const Alert: (prompt: string, onConfirm?: () => boolean | void, title?: string) => void;
