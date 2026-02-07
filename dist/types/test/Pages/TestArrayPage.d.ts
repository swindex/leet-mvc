import { Forms } from "../../components/Forms";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
export declare class TestArrayPage extends HeaderPage {
    arr: any[];
    objarr: any[];
    findex: number;
    formarr: Forms[];
    objobj: Record<string, any>;
    constructor();
    get template(): string;
    onAddClicked(): void;
    onDeleteItemClicked(index: number): void;
    onAddFormClicked(): void;
    onDeleteFormItemClicked(index: number): void;
}
