export declare class FileAccess {
    /** Check if file reading is supported */
    static get isSupported(): boolean;
    /**
     * Read file blob from fileField.files[0]
     */
    static ReadFile(fileBlob: File): {
        DataURL(): Promise<string>;
        ArrayBuffer(): Promise<ArrayBuffer>;
        BinaryString(): Promise<string>;
        Text(): Promise<string>;
    };
}
