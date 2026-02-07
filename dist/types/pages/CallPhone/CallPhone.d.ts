import './CallPhone.scss';
import { DialogPage } from "../DialogPage/DialogPage";
export declare class CallPhone extends DialogPage {
    constructor(title: any, prompt: any, numberPre: any, number: any, useSMS: any);
    getCallUrl(): string;
    getTextUrl(): string;
    onCancelClicked(): boolean;
    onCallClicked(evt: any): void;
    onTextClicked(): void;
}
