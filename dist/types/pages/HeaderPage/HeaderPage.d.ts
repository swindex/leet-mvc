import './HeaderPage.scss';
import { BasePage } from '../BasePage';
/**
 * A page with header and menu and back buttons
 */
export declare class HeaderPage extends BasePage {
    constructor();
    /**
       * ***Override***
       */
    onBackButtonClicked(): void;
    /**
       * ***Override***
       */
    onMenuButtonClicked(): void;
    /**
       * ***Override***
       */
    onRefreshButtonClicked(): void;
    /**
       * ***Override***
       */
    onSearchButtonClicked(): void;
    get template(): string;
}
