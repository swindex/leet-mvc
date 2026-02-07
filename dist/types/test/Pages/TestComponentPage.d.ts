import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
export declare class TestComponentPage extends HeaderPage {
    counter: number;
    comp: any;
    constructor();
    onCreateCompClicked(): void;
    onIncrementClicked(): void;
    get template(): string;
}
