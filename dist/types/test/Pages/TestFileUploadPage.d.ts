import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { Forms } from "../../components/Forms";
export declare class TestFileUploadPage extends HeaderPage {
    fileField: string;
    fileFieldFileData: any;
    fileFieldImage: string;
    formData: any;
    form: Forms;
    constructor();
    get template(): string;
    fileFieldChanged(evt: Event): void;
    fileFieldUploadClicked(): void;
    formUploadClicked(): void;
}
