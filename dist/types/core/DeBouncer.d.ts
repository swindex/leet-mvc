/**
 * DeBouncer module
 */
export declare const DeBouncer: {
    /**
     * Run debounced function FIRST only ONCE per life of the debouncer
     */
    onceFirst: <T extends (...args: any[]) => any>(func?: T) => (...args: Parameters<T>) => void;
    /**
     * Run debounced function LAST only ONCE per life of the debouncer
     */
    onceLast: <T_1 extends (...args: any[]) => any>(func?: T_1) => (...args: Parameters<T_1>) => void;
    /**
     * Run debounced function FIRST only ONCE per animation FRAME
     */
    frameFirst: <T_2 extends (...args: any[]) => any>(func?: T_2) => (...args: Parameters<T_2>) => void;
    /**
     * Run debounced function LAST only ONCE per animation FRAME
     */
    frameLast: <T_3 extends (...args: any[]) => any>(func?: T_3) => (...args: Parameters<T_3>) => void;
    /**
     * Run debounced function FIRST only ONCE per TIMEOUT
     */
    timeoutFirst: <T_4 extends (...args: any[]) => any>(timeoutMs: number, func?: T_4) => (...args: Parameters<T_4>) => void;
    /**
     * Run debounced function LAST only ONCE per TIMEOUT
     */
    timeoutLast: <T_5 extends (...args: any[]) => any>(timeoutMs: number, func?: T_5) => (...args: Parameters<T_5>) => void;
};
