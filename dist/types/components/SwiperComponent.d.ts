import 'swiper/swiper-bundle.css';
import { BaseComponent } from "./BaseComponent";
export declare class SwiperComponent extends BaseComponent {
    /**
     * @param {{navigation?: true,submitButton?:string,pagination?:true, slidesPerView?: number|'auto' }} [options]
     */
    constructor(options: any);
    indexChange(value: any): void;
    slideTo(index: any, callEvents: any): void;
    _isShowSubmitButton(): any;
    /**
     * ***Override***
     * Called on button click.
     * @return {boolean} return false to hide the submit button
     */
    isSghowSubmitButton(): boolean;
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
    /**
     * ***Override***
     * Called on submit button click.
     */
    onSubmitClicked(): void;
    /**
     * ***Override***
     * Called on slide change
     * Return false to cancel slide change
     * @param {number} index
     * @param {number} oldIndex
     * @return {void|false}
     */
    onSlideChange(index: any, oldIndex: any): void;
    onInit(container: any): void;
}
