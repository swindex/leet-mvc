export interface MapSettings {
    zoom?: number;
    center?: any;
    mapTypeControlOptions?: any;
    mapTypeId?: any;
    disableDefaultUI?: boolean;
}
export interface DirectionSettings {
    travelMode?: string;
    unitSystem?: number;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
    provideRouteAlternatives?: boolean;
    origin?: any;
    destination?: any;
}
export interface MapElementInstance {
    mapHtmlElement: HTMLElement | null;
    directionsHtmlElement: HTMLElement | null;
    getLocation: (Latitude: number, Longitude: number) => any;
    getMap: (callback: (map: any) => void) => void;
    getMarkers: (callback: (markers: any[]) => void) => void;
    setEndLocation: (Latitude: number, Longitude: number) => MapElementInstance | false;
    watchStartPosition: () => void;
    destroy: () => void;
    setStartGps: (resolve?: (location: any) => void, reject?: (err: any) => void, options?: PositionOptions) => MapElementInstance;
    setStartLocation: (Latitude: number, Longitude: number) => MapElementInstance;
    setEndText: (text: string) => MapElementInstance;
    setStartText: (text: string) => MapElementInstance;
    centerEnd: () => MapElementInstance;
    centerStart: () => MapElementInstance;
    centerOn: (location: any) => MapElementInstance;
    panToStart: () => MapElementInstance;
    setEndAddress: (address: string, callback?: (location: any) => void) => MapElementInstance;
    showEndMarker: (imageURI?: string) => MapElementInstance;
    showStartMarker: (imageURI?: string) => MapElementInstance;
    setMarker: (lat: number, lng: number, imageURI: string, onClick?: (marker: any) => void, label?: string | {
        text: string;
        color: string;
    }) => MapElementInstance;
    clearMarkers: () => MapElementInstance;
    setOptions: (opt: MapSettings) => void;
    setDirectionsOptions: (options: DirectionSettings) => void;
    generateRoute: (opts?: DirectionSettings, noLoader?: boolean) => MapElementInstance;
    clearRoute: () => MapElementInstance;
    showMapSettings: (callback?: (mapSettings: MapSettings, directionSettings: DirectionSettings) => void) => void;
    setDirections: (elem: HTMLElement) => MapElementInstance;
    init: (element: HTMLElement, opts?: MapSettings) => MapElementInstance;
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
export declare var MapElement: new (API_KEY: string, API_VERSION: string, LANGUAGE: string) => MapElementInstance;
