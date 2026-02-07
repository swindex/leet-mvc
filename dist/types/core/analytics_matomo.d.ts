declare global {
    interface Window {
        device?: {
            platform: string;
            model: string;
        };
    }
}
interface AnalyticsConfig {
    SiteId: number;
    URL: string;
}
export declare class Analytics {
    static get Event(): {
        readonly USERLOGIN: "Login";
        readonly APPERROR: "App Error";
        readonly LOADFILE: "Load File";
        readonly APIERROR: "API Error";
        readonly LOGINFAIL: "Login Failure";
        readonly SEARCH: "Search";
    };
    static get Page(): {
        readonly App: "Open App";
    };
    static get UserProperty(): {
        readonly USER_TYPE: "User_Type";
    };
    static get ActionProperty(): {
        readonly ORDER_BRANCH_NAME: "Branch_Name";
    };
    static get Dimension(): {
        readonly Visit_AMC_Name: 1;
    };
    private config;
    private Tracker;
    private PrevScreenUrl;
    private PrevScreenName;
    /**
     * Create Tracker instance
     */
    constructor(config: AnalyticsConfig);
    /** Create tracker instance */
    init(): void;
    /**
     * Enable/Disable analytics collection
     */
    collectAnalytics(collectFlag: boolean): void;
    /**
     * Set current page name
     */
    setScreenName(name: string, optionalUrl?: string | null): this;
    setOutLink(url: string): void;
    createPageURL(name: string): string;
    markNewVisit(): void;
    setUserId(id: string | number): this;
    setUserProperty(propertyName: string | number, propertyValue: string | number): this;
    setActionProperty(propertyName: string | number, propertyValue: string | number): this;
    setPersistentActionProperty(propertyName: string | number, propertyValue: string | number): this;
    clearPersistentActionProperties(): this;
    setVisitDimension(propertyName: string | number, propertyValue: string | number): void;
    setActionDimension(propertyName: string | number, propertyValue: string | number): void;
    /**
     * Call after setting all user/visit related data
     */
    logVisit(): this;
    logEvent(eventAction: string | null, eventName?: any, eventValue?: any): this;
}
export {};
