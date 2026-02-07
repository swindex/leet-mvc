import "./LoginPage.scss";
import { HeaderPage } from "./../HeaderPage/HeaderPage";
export declare class LoginPage extends HeaderPage {
    constructor();
    _init(): void;
    onInit(): void;
    onResize(): void;
    validateForm(): boolean;
    onLoginClicked(__e: any): void;
    /**
       * ***Override***
       * Called when form is validated and login data can be submitted
       * @param {{username: string, password:string, remember: boolean}} data
       */
    onLoginSubmit(data: any): void;
    onForgotClicked(): void;
    /**
       * ***Override***
       * Called when Forgot Password is clicked
       * @param {{username: string, password:string, remember: boolean}} data
       * */
    onForgotSubmit(data: any): void;
    /**
       * ***Override***
       * Called when Register is clicked
       */
    onRegisterClicked(): void;
    /**
       * ***Override***
       * Called when Language is clicked
       */
    onLanguageClicked(): void;
    /**
       * ***Override***
       * Called when location is clicked
       */
    onLocationClicked(): void;
    togglePasswordType(): void;
}
