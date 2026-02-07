import GoogleMapsLoader from 'google-maps';
import { Loader } from '../pages/Loader/Loader';
import { empty, tryCall } from './helpers';
import { Dialog } from './../pages/DialogPage/DialogPage';
import { Translate } from './Translate';

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
  setMarker: (lat: number, lng: number, imageURI: string, onClick?: (marker: any) => void, label?: string | { text: string; color: string }) => MapElementInstance;
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
export var MapElement = function(this: MapElementInstance, API_KEY: string, API_VERSION: string, LANGUAGE: string): void {
  const self = this;
  let google: any = null;
  let options: MapSettings = {};
  let map: any = null;
  let start: any = null;
  let end: any = null;
  let endText: string | null = null;
  let endMarker: any = null;
  let startMarker: any = null;

  let markers: any[] = [];

  let directionsDisplay: any = null;
  let directionsService: any = null;

  this.mapHtmlElement = null;
  this.directionsHtmlElement = null;

  let directionsRendererOptions: any = {
    suppressMarkers: false,
    preserveViewport: true
  };

  (GoogleMapsLoader as any).KEY = API_KEY;
  (GoogleMapsLoader as any).VERSION = API_VERSION;
  (GoogleMapsLoader as any).LANGUAGE = LANGUAGE;
  let wait: Array<() => void> = [];

  this.getLocation = getLocation;
  function getLocation(Latitude: number, Longitude: number): any {
    return new google.maps.LatLng(Number(Latitude), Number(Longitude));
  }

  /**
   * Get MAP object
   */
  this.getMap = function(callback: (map: any) => void): void {
    addWorker(function() {
      tryCall(null, callback, map);
      nextWorker();
    });
  };

  /**
   * Get Map Markers object
   */
  this.getMarkers = function(callback: (markers: any[]) => void): void {
    addWorker(function() {
      tryCall(null, callback, markers);
      nextWorker();
    });
  };


  /**
   * Set End Address
   */
  this.setEndLocation = function(Latitude: number, Longitude: number): MapElementInstance | false {
    if (!Latitude || !Longitude || isNaN(Latitude) || isNaN(Longitude))
      return false;
    addWorker(function() {
      end = new google.maps.LatLng(Number(Latitude), Number(Longitude));
      nextWorker();
    });
    return this;
  };

  let positionTimer: number | null = null;
  
  this.watchStartPosition = function(): void {
    addWorker(function() {
      if (startMarker != null) {
        positionTimer = navigator.geolocation.watchPosition(
          function(position) {
            if (empty(start) || start.lat().toFixed(4) != position.coords.latitude.toFixed(4) || start.lng().toFixed(4) != position.coords.longitude.toFixed(4)) {
              self.setStartLocation(position.coords.latitude, position.coords.longitude);
              startMarker.setPosition(getLocation(position.coords.latitude, position.coords.longitude));
              self.generateRoute(undefined, true);
            }
          },
          undefined,
          { maximumAge: 5000, enableHighAccuracy: false }
        );
      }
      nextWorker();
    });
  };

  this.destroy = function(): void {
    if (positionTimer !== null)
      navigator.geolocation.clearWatch(positionTimer);
  };

  /**
   * Set start to current GPS location
   */
  this.setStartGps = function(resolve?: (location: any) => void, reject?: (err: any) => void, options?: PositionOptions): MapElementInstance {
    addWorker(function() {
      const loader = Loader().container(self.mapHtmlElement!.parentElement!).timeout(5000).show(Translate("Acquiring GPS.."));
      navigator.geolocation.getCurrentPosition(function success(pos) {
        loader.hide();
        start = new google.maps.LatLng(Number(pos.coords.latitude), Number(pos.coords.longitude));
        tryCall(null, resolve, start);
        nextWorker();
      }, function fail(err) {
        loader.hide();
        console.log("unable to acquire GPS", err);
        tryCall(null, reject, err);
        nextWorker();
      }, options || { maximumAge: 500000, timeout: 10000, enableHighAccuracy: true });
    });
    return this;
  };

  /**
   * Set End Location
   */
  this.setStartLocation = function(Latitude: number, Longitude: number): MapElementInstance {
    addWorker(function() {
      start = new google.maps.LatLng(Number(Latitude), Number(Longitude));
      nextWorker();
    });
    return this;
  };

  /**
   * Set End Text
   */
  this.setEndText = function(text: string): MapElementInstance {
    endText = text;
    return this;
  };

  /**
   * Set Start Text
   */
  this.setStartText = function(text: string): MapElementInstance {
    endText = text;
    return this;
  };

  /**
   * Center on End location
   */
  this.centerEnd = function(): MapElementInstance {
    addWorker(function() {
      if (!empty(end))
        map.setCenter(end);
      nextWorker();
    });
    return this;
  };

  /**
   * Center on Start location
   */
  this.centerStart = function(): MapElementInstance {
    addWorker(function() {
      if (!empty(start))
        map.setCenter(start);
      nextWorker();
    });
    return this;
  };

  /**
   * Center on location
   */
  this.centerOn = function(location: any): MapElementInstance {
    addWorker(function() {
      if (!empty(location))
        map.setCenter(location);
      nextWorker();
    });
    return this;
  };

  /**
   * Move to location
   */
  this.panToStart = function(): MapElementInstance {
    addWorker(function() {
      if (!empty(start))
        map.panTo(start);
      nextWorker();
    });
    return this;
  };

  /**
   * Set Destination location by its string address
   */
  this.setEndAddress = function(address: string, callback?: (location: any) => void): MapElementInstance {
    addWorker(function() {
      const geocoder = new google.maps.Geocoder();
      if (geocoder) {
        const loader = Loader().container(self.mapHtmlElement!.parentElement!).timeout(5000).show();
        geocoder.geocode({ 'address': address }, function(results: any, status: any) {
          loader.hide();
          if (status == google.maps.GeocoderStatus.OK) {
            if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
              end = results[0].geometry.location;
              if (typeof callback === 'function')
                callback(end);
            } else {
              console.log('Error: No results found!');
            }
          } else {
            console.log('Geocode was not successful for the following reason: ' + status);
          }
          nextWorker();
        });
      } else
        nextWorker();
    });
    return this;
  };

  /**
   * Display End Marker
   */
  this.showEndMarker = function(imageURI?: string): MapElementInstance {
    directionsRendererOptions.suppressMarkers = true;
    addWorker(function() {
      if (!empty(endMarker))
        endMarker.setMap(null);
      endMarker = setMarker(end, imageURI);
      nextWorker();
    });
    return this;
  };

  /**
   * Display Start marker
   */
  this.showStartMarker = function(imageURI?: string): MapElementInstance {
    directionsRendererOptions.suppressMarkers = true;
    addWorker(function() {
      if (!empty(startMarker))
        startMarker.setMap(null);
      startMarker = setMarker(start, imageURI);
      nextWorker();
    });
    return this;
  };

  /**
   * Create marker on map
   */
  function setMarker(location: any, imageURI?: string): any {
    if (empty(location))
      return null;
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: imageURI
    });
    return marker;
  }

  /**
   * Create marker on map within worker
   */
  this.setMarker = function(lat: number, lng: number, imageURI: string, onClick?: (marker: any) => void, label?: string | { text: string; color: string }): MapElementInstance {
    addWorker(function() {
      const marker = new google.maps.Marker({
        position: getLocation(lat, lng),
        map: map,
        icon: imageURI,
        label: label
      });
      marker.addListener('click', function(this: any, e: Event) { event?.preventDefault(); onClick?.(this); });
      markers.push(marker);
      nextWorker();
    });
    return this;
  };

  this.clearMarkers = function(): MapElementInstance {
    addWorker(function() {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
      nextWorker();
    });
    return this;
  };

  /**
   * Set Map Options
   */
  this.setOptions = function(opt: MapSettings): void {
    options = opt;
    addWorker(function() {
      map.setOptions(options);
      nextWorker();
    });
  };

  /**
   * Set directions options
   */
  this.setDirectionsOptions = function(opts: DirectionSettings): void {
    generateRouteOptions = opts;
  };

  let generateRouteOptions: DirectionSettings | null = null;

  /**
   * Generate Route
   */
  this.generateRoute = function(opts?: DirectionSettings, noLoader?: boolean): MapElementInstance {
    opts = opts || generateRouteOptions || undefined;
    noLoader = noLoader || false;
    if (opts) generateRouteOptions = opts;
    addWorker(function() {
      if (empty(start)) {
        self.directionsHtmlElement!.innerHTML = `<div class="error">Unable to get directions: Your loaction is missing</div>`;
        nextWorker();
      } else if (empty(end)) {
        self.directionsHtmlElement!.innerHTML = `<div class="error">Unable to get directions: Destination loaction is missing</div>`;
        nextWorker();
      } else {
        let loader: any;
        if (!noLoader)
          loader = Loader().container(self.directionsHtmlElement!.parentElement!).timeout(5000).show();
        directionsService.route(Object.assign({
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING

        }, opts), function(response: any, status: any) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
          if (!noLoader)
            loader.hide();
          nextWorker();
        });
      }
    });
    return this;
  };

  this.clearRoute = function(): MapElementInstance {
    addWorker(function() {
      directionsDisplay.setDirections({ routes: [] });
      nextWorker();
    });
    return this;
  };

  this.showMapSettings = function(callback?: (mapSettings: MapSettings, directionSettings: DirectionSettings) => void): void {
    const map_settings = options;
    let directions_settings = generateRouteOptions || {} as DirectionSettings;

    const d = Dialog(Translate("Map Settings")) as any;

    d.addCheck('disableDefaultUI', Translate('Show Map Controls'), !map_settings.disableDefaultUI);

    if (self.directionsHtmlElement) {
      d.addSelect("travelMode", Translate('Travel Mode'), directions_settings.travelMode, null, [
        { value: 'DRIVING', title: Translate("Driving") },
        { value: 'BICYCLING', title: Translate("Bicycling") },
        { value: 'TRANSIT', title: Translate("Transit") },
        { value: 'WALKING', title: Translate("Walking") },
      ]);

      d.addSelect('unitSystem', Translate('Map Units'), Number(directions_settings.unitSystem), null, [
        { value: 0, title: Translate("Metric") },
        { value: 1, title: Translate("Imperial") },
      ]);

      d.addCheck("avoidTolls", Translate('Avoid Tolls'), directions_settings.avoidTolls);
      d.addCheck("avoidHighways", Translate('Avoid Highways'), directions_settings.avoidHighways);
      d.addCheck("avoidFerries", Translate('Avoid Ferries'), directions_settings.avoidFerries);
      d.addCheck("provideRouteAlternatives", Translate('Provide route alternatives'), directions_settings.provideRouteAlternatives);
    }
    d.addActionButton("Cancel", function() { });
    d.addActionButton("Ok", function() {
      const res = d.data;

      if (self.directionsHtmlElement) {
        directions_settings = {
          travelMode: res.travelMode,
          unitSystem: Number(res.unitSystem),
          avoidTolls: res.avoidTolls,
          avoidHighways: res.avoidHighways,
          avoidFerries: res.avoidFerries,
          provideRouteAlternatives: res.provideRouteAlternatives,
        };
        generateRouteOptions = directions_settings;
      }
      const newMapSettings: MapSettings = {
        disableDefaultUI: !res.disableDefaultUI,
      };
      self.setOptions(newMapSettings);
      tryCall(null, callback, newMapSettings, directions_settings);
    });
  };

  /**
   * Set Directions container element
   */
  this.setDirections = function(elem: HTMLElement): MapElementInstance {
    self.directionsHtmlElement = elem;
    const setDirectionsWorker = function() {
      directionsDisplay.setPanel(elem);
      nextWorker();
    };
    addWorker(setDirectionsWorker);
    return this;
  };

  /**
   * Initialize map element
   */
  this.init = function(element: HTMLElement, opts?: MapSettings): MapElementInstance {
    if (opts) options = opts;
    self.mapHtmlElement = element;
    addWorker(function() {
      const loader = Loader().container(element.parentElement!).timeout(5000).show();

      (GoogleMapsLoader as any).load(function(_google: any) {
        google = _google;

        options = Object.assign({
          zoom: 12,
          center: new google.maps.LatLng(10, 10),
          mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        }, options);

        map = new google.maps.Map(element, options);
        directionsDisplay = new google.maps.DirectionsRenderer(directionsRendererOptions);
        directionsService = new google.maps.DirectionsService;
        directionsDisplay.setMap(map);
        loader.hide();
        google.maps.event.trigger(map, 'resize');
        nextWorker();
      }); //end GoogleMapsLoader
    });
    return this;
  };

  this.startWorkers = function(): void {
    nextWorker(true);
  };

  this.onWorkersFinished = function(): void {
    // Override this callback
  };

  let workerFinished = false;
  let workerStarted = false;
  let workersAdded = false;

  /**
   * Run next worker.
   */
  function nextWorker(start?: true): void {
    if (start === true)
      workerStarted = true;

    if (workerStarted === true && wait.length > 0) {
      wait.shift()!();
    } else if (workerStarted === true) {
      self.onWorkersFinished();
      workerFinished = true;
    }
  }

  /**
   * Add worker to queue.
   */
  function addWorker(callback: () => void): void {
    wait.push(callback);
    //start worker if supposed to start
    if (workerFinished) {
      workerFinished = false;
      nextWorker();
    }
    workersAdded = true;
  }
} as any as { new(API_KEY: string, API_VERSION: string, LANGUAGE: string): MapElementInstance };