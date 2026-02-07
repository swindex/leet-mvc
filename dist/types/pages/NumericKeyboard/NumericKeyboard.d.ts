import './NumericKeyboardPage.scss';
export declare var NumericKeyboard: {
    isEnabled: boolean;
    /** @type {NumericKeyboardPage} */
    _page: any;
    options: {
        /** 0 - Tall simple, 1 -Tall Full, 2 - short full */
        layout: number;
        selectOnFocus: boolean;
        selectForeColor: string;
        selectBackColor: string;
        bodyResizeDelay: number;
        theme: string;
    };
    enable(): void;
    disable(): void;
    onClick(): void;
};
