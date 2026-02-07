declare global {
    interface Window {
        LEET_REGISTER: Record<string, any>;
        Registered: typeof Registered;
    }
}
/**
 * Register component to be used anywhere
 */
export declare function RegisterComponent<T>(componentClass: T, tagName: string): T;
/**
 * Get registered component by name
 */
export declare function Registered<T = any>(name: string): T;
