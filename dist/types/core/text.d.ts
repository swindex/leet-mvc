export declare const Text: {
    escapeHTML: (unsafe: string | any, convertNewlines?: boolean) => string;
    escapeAttribute: (unsafe: string | any) => string;
    /**
     * Safely convert to string. Null or undefined convert to an empty string
     */
    toString(val: any): string;
    /**
     * Safely lower-case a string
     */
    toLowerCase(val: any): string;
    /**
     * Format phone number while typing
     * @param text - phone number to format
     * @param mask - default: { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' }
     */
    formatPhone: (text: string | null, mask?: Record<number, string>) => string;
    /**
     * Get File Extension (without DOT)
     */
    fileExtension: (fName: string | null) => string;
    /**
     * Get File Name.Extension
     */
    fileFullName: (fileName: string | null) => string;
    /**
     * Get File Name without Extension
     */
    fileName: (fileName: string | null) => string;
    /**
     * Join file path bits making sure there is / between them and no duplicates
     */
    joinPath: (...args: string[]) => string;
    /**
     * Capitalize text
     */
    capitalize(value: string | any): string;
};
