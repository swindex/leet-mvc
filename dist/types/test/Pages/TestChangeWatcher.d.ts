import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
export declare class TestChangeWatcher extends HeaderPage {
    object: any;
    log: string;
    constructor();
    mutate(): void;
    hookWatchers(): void;
    unHookWatchers(): void;
    memTest(): void;
    onNewWindow(): void;
    get template(): string;
}
