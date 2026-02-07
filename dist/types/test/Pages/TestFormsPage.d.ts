import { Forms } from "../../components/Forms";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
export declare class TestFormsPage extends HeaderPage {
    form1data: any;
    form1errors: any;
    form1attributes: any;
    testNumber: number;
    form1template: any[];
    form1: Forms;
    visibleForm1data: any;
    isValid: boolean;
    constructor();
    onClicked(): void;
    validate(): void;
    get template(): string;
}
