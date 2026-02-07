import { DialogPage } from "./../DialogPage/DialogPage";
import './DirectionsPage.scss';
export declare class DirectionsPage extends DialogPage {
    /**
       *
       * @param {*} p
       * @param {{isShowPropertyDirections: boolean, language: string, lat: number,lng: number,address: string, API:{ KEY: string, VERSION: string, Location:{lat: number,lng: number}}, map_settings:{}, direction_settings : {}}} options
       */
    constructor(options: any);
    onInit(): void;
    onLoaded(): void;
    initMap(): void;
    onUpdated(): void;
    onDestroy(): void;
    onMapSettingsButtonClicked(): void;
    onNavigationButtonClicked(): void;
    /**
       * ***Overwrite***
       * @param {object} map_settings
       * @param {object} directions_settings
       */
    onUpdatedMapSettings(map_settings: any, directions_settings: any): void;
    /**
       * ***Overwrite***
       * @param {string} address
       */
    onLaunchedNavigator(address: any): void;
}
