import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
export declare class RootPage extends HeaderPage {
    pages: {
        page: any;
        name: string;
    }[];
    constructor();
    loadPage(index: number): void;
    get template(): string;
}
