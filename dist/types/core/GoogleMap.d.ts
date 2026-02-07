import { MapSettings, DirectionSettings } from './MapElement';
export interface GoogleMapInstance {
    mapHtmlElement: HTMLElement | null;
    directionsHtmlElement: HTMLElement | null;
    map: any;
    getLocation: (Latitude: number, Longitude: number) => any;
    getMap: (callback: (map: any) => void) => any;
    getMarkers: (callback: (markers: any[]) => void) => void;
    setEndLocation: (Latitude: number, Longitude: number) => GoogleMapInstance | false;
    watchStartPosition: () => void;
    destroy: () => void;
    setStartGps: (resolve?: (location: any) => void, reject?: (err: any) => void, options?: PositionOptions) => GoogleMapInstance;
    setStartLocation: (Latitude: number, Longitude: number) => GoogleMapInstance;
    setEndText: (text: string) => GoogleMapInstance;
    setStartText: (text: string) => GoogleMapInstance;
    centerEnd: () => GoogleMapInstance;
    centerStart: () => GoogleMapInstance;
    centerOn: (location: any) => GoogleMapInstance;
    setZoom: (zoom: number) => GoogleMapInstance;
    panToStart: () => GoogleMapInstance;
    setEndAddress: (address: string, callback?: (location: any) => void) => GoogleMapInstance;
    showEndMarker: (imageURI?: string) => GoogleMapInstance;
    showStartMarker: (imageURI?: string) => GoogleMapInstance;
    drawCircleAtStart: (rad: number) => GoogleMapInstance;
    removeCircle: () => void;
    onCenterChanged: (center: {
        lat: number;
        lng: number;
    }) => void;
    onZoomChanged: (zoom: number) => void;
    setMarker: (lat: number, lng: number, imageURI: string, onClick?: (marker: any) => void, label?: string | {
        text: string;
        color: string;
    }) => GoogleMapInstance;
    clearMarkers: () => GoogleMapInstance;
    setOptions: (opt: MapSettings) => void;
    setDirectionsOptions: (options: DirectionSettings) => void;
    generateRoute: (opts?: DirectionSettings | null, noLoader?: boolean) => GoogleMapInstance;
    clearRoute: () => GoogleMapInstance;
    showMapSettings: (callback?: (mapSettings: MapSettings, directionSettings: DirectionSettings) => void) => void;
    setDirections: (elem: HTMLElement) => GoogleMapInstance;
    getCenter: (callback: (center: any) => void) => GoogleMapInstance;
    init: (element: HTMLElement, opts?: MapSettings) => GoogleMapInstance;
    startWorkers: () => void;
    onWorkersFinished: () => void;
}
/** Wrapper for google Maps API */
/**
 * Create an instance of map
 * @param API_KEY
 * @param API_VERSION
 * @param LANGUAGE
 */
export declare function GoogleMap(API_KEY: string, API_VERSION: string, LANGUAGE: string): GoogleMapInstance;
