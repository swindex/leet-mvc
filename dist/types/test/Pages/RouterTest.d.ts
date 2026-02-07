import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { NavController } from "../../core/NavController";
export declare class RouterTestPage extends HeaderPage {
    router: RouterNavigator;
    constructor();
    onInit(): void;
    onPage1Click(): void;
    onPage2Click(): void;
    onPage3Click(): void;
    onPage4Click(): void;
    onPageRootClick(): void;
    get template(): string;
}
interface RouteConfig {
    name?: string;
    page: (params?: any) => any;
}
interface RouterOptions {
    routes: RouteConfig[];
}
interface RouterState {
    name: string;
    args: any[];
    index: number;
    guid: string;
}
declare class RouterNavigator extends NavController {
    options: RouterOptions;
    index: number;
    lastStateIndex: number;
    initialLength: number;
    currentState: RouterState | null;
    constructor(options: RouterOptions);
    matchLocation(setRoot?: boolean): void;
    destroy(): void;
    onPopState(event: PopStateEvent): any;
    setRoot(name: any, ...args: any[]): any;
    push(name: any, ...args: any[]): any;
    getRoute(name: string): RouteConfig;
}
export {};
