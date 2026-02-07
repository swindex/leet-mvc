import { Forms } from "./Forms";
import 'swiper/dist/css/swiper.css';
export declare class SwiperForms extends Forms {
    /**
     *
     * @param {FieldTemplate[]} formTemplate
     * @param {*} data
     * @param {*} [errors]
     * @param {*} [attrs]
     * @param {{navButtons?: true,submitButton?:boolean,pagination?:true, navigation?:boolean, nestedData?:boolean}} [options]
     */
    constructor(formTemplate: any, data: any, errors: any, attrs: {}, options: any);
    _isShowSubmitButton(): any;
    /**
     * ***Override***
     * Called on button click.
     * @return {void|false} return false to cancel slide action
     */
    onBackClicked(): void;
    /**
     * ***Override***
     * Called on button click.
     * @return {void|false} return false to cancel slide action
     */
    onNextClicked(): void;
    onSubmitClicked(): void;
    /**
     * ***Override***
     * @param {number} index
     */
    onSlideChange(index: any): void;
    /**
     * Slide the swiper to the first invalid form
     */
    slideToInvalid(speed: any, runCallbacks: any): void;
    onInit(container: any): void;
}
