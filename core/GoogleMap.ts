import GoogleMapsLoader from 'google-maps';
import { Loader } from '../pages/Loader/Loader';
import { empty, tryCall } from './helpers';
import { Dialog } from './../pages/DialogPage/DialogPage';
import { Translate } from './Translate';
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
  onCenterChanged: (center: { lat: number; lng: number }) => void;
  onZoomChanged: (zoom: number) => void;
  setMarker: (lat: number, lng: number, imageURI: string, onClick?: (marker: any) => void, label?: string | { text: string; color: string }) => GoogleMapInstance;
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
export function GoogleMap(API_KEY: string, API_VERSION: string, LANGUAGE: string): GoogleMapInstance {

  const self: GoogleMapInstance = {} as GoogleMapInstance;
  let google: any = null;
  let options: MapSettings = {};
  let map: any = null;
  let start: any = null;
  let end: any = null;
  let endText: string | null = null;
  let endMarker: any = null;
  let startMarker: any = null;

  let circleClusterremove: any[] = [];
  let buffer_circle: any = null;

  let markers: any[] = [];

  let directionsDisplay: any = null;
  let directionsService: any = null;

  self.mapHtmlElement = null;
  self.directionsHtmlElement = null;

  let directionsRendererOptions: any = {
    suppressMarkers: false,
    preserveViewport: true
  };

  (GoogleMapsLoader as any).KEY = API_KEY;
  (GoogleMapsLoader as any).VERSION = API_VERSION;
  (GoogleMapsLoader as any).LANGUAGE = LANGUAGE;
  let wait: Array<() => void> = [];

  self.getLocation = getLocation;
  function getLocation(Latitude: number, Longitude: number): any {
    return new google.maps.LatLng(Number(Latitude), Number(Longitude));
  }

  /**
   * Get MAP object
   */
  self.getMap = function(callback: (map: any) => void): any {
    addWorker(function() {
      tryCall(null, callback, map);
      nextWorker();
    });
    return map;
  };

  /**
   * Get Map Markers object
   */
  self.getMarkers = function(callback: (markers: any[]) => void): void {
    addWorker(function() {
      tryCall(null, callback, markers);
      nextWorker();
    });
  };

  /**
   * Set End Address
   */
  self.setEndLocation = function(Latitude: number, Longitude: number): GoogleMapInstance | false {
    if (!Latitude || !Longitude || isNaN(Latitude) || isNaN(Longitude))
      return false;
    addWorker(function() {
      end = new google.maps.LatLng(Number(Latitude), Number(Longitude));
      nextWorker();
    });
    return self;
  };

  let positionTimer: number | null = null;

  self.watchStartPosition = function(): void {
    addWorker(function() {
      if (startMarker != null) {
        positionTimer = navigator.geolocation.watchPosition(
          function(position) {
            if (empty(start) || start.lat().toFixed(4) != position.coords.latitude.toFixed(4) || start.lng().toFixed(4) != position.coords.longitude.toFixed(4)) {
              self.setStartLocation(position.coords.latitude, position.coords.longitude);
              startMarker.setPosition(getLocation(position.coords.latitude, position.coords.longitude));
              self.generateRoute(null, true);
            }
          },
          undefined,
          { maximumAge: 5000, enableHighAccuracy: false }
        );
      }
      nextWorker();
    });
  };

  self.destroy = function(): void {
    if (positionTimer !== null)
      navigator.geolocation.clearWatch(positionTimer);
  };

  /**
   * Set start to current GPS location
   */
  self.setStartGps = function(resolve?: (location: any) => void, reject?: (err: any) => void, gpsOptions?: PositionOptions): GoogleMapInstance {
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
      }, gpsOptions || { maximumAge: 500000, timeout: 10000, enableHighAccuracy: true });
    });
    return self;
  };

  /**
   * Set End Location
   */
  self.setStartLocation = function(Latitude: number, Longitude: number): GoogleMapInstance {
    addWorker(function() {
      start = new google.maps.LatLng(Number(Latitude), Number(Longitude));
      nextWorker();
    });
    return self;
  };

  /**
   * Set End Text
   */
  self.setEndText = function(text: string): GoogleMapInstance {
    endText = text;
    return self;
  };

  /**
   * Set Start Text
   */
  self.setStartText = function(text: string): GoogleMapInstance {
    endText = text;
    return self;
  };

  /**
   * Center on End location
   */
  self.centerEnd = function(): GoogleMapInstance {
    addWorker(function() {
      if (!empty(end))
        map.setCenter(end);
      nextWorker();
    });
    return self;
  };

  /**
   * Center on Start location
   */
  self.centerStart = function(): GoogleMapInstance {
    addWorker(function() {
      if (!empty(start))
        map.setCenter(start);
      nextWorker();
    });
    return self;
  };

  /**
   * Center on location
   */
  self.centerOn = function(location: any): GoogleMapInstance {
    addWorker(function() {
      if (!empty(location))
        map.setCenter(location);
      nextWorker();
    });
    return self;
  };

  /**
   * Set map Zoom level
   */
  self.setZoom = function(zoom: number): GoogleMapInstance {
    addWorker(function() {
      if (!empty(zoom))
        map.setZoom(zoom);
      nextWorker();
    });
    return self;
  };

  /**
   * Move to location
   */
  self.panToStart = function(): GoogleMapInstance {
    addWorker(function() {
      if (!empty(start))
        map.panTo(start);
      nextWorker();
    });
    return self;
  };

  /**
   * Set Destination location by its string address
   */
  self.setEndAddress = function(address: string, callback?: (location: any) => void): GoogleMapInstance {
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
    return self;
  };

  /**
   * Display End Marker
   */
  self.showEndMarker = function(imageURI?: string): GoogleMapInstance {
    directionsRendererOptions.suppressMarkers = true;
    addWorker(function() {
      if (!empty(endMarker))
        endMarker.setMap(null);
      endMarker = setMarker(end, imageURI);
      nextWorker();
    });
    return self;
  };

  /**
   * Display Start marker
   */
  self.showStartMarker = function(imageURI?: string): GoogleMapInstance {
    directionsRendererOptions.suppressMarkers = true;
    addWorker(function() {
      if (!empty(startMarker))
        startMarker.setMap(null);
      startMarker = setMarker(start, imageURI);
      nextWorker();
    });
    return self;
  };

  self.drawCircleAtStart = function(rad: number): GoogleMapInstance {
    addWorker(function() {
      if (buffer_circle != null) {
        buffer_circle.setMap(null);
      }
      buffer_circle = new google.maps.Circle({
        center: start,
        radius: rad,
        strokeColor: "#2196f3",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#638fab",
        fillOpacity: 0.1,
        map: map
      });
      circleClusterremove.push(buffer_circle);
      nextWorker();
    });
    return self;
  };

  self.removeCircle = function(): void {
    try {
      for (let i = 0; i < circleClusterremove.length; i++) {
        circleClusterremove[i].setMap(null);
      }
      circleClusterremove = [];
    }
    catch (Error) {
    }
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

  self.onCenterChanged = function(center: { lat: number; lng: number }): void { };
  self.onZoomChanged = function(zoom: number): void { };

  /**
   * Create marker on map within worker
   */
  self.setMarker = function(lat: number, lng: number, imageURI: string, onClick?: (marker: any) => void, label?: string | { text: string; color: string }): GoogleMapInstance {
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
    return self;
  };

  self.clearMarkers = function(): GoogleMapInstance {
    addWorker(function() {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
      nextWorker();
    });
    return self;
  };

  /**
   * Set Map Options
   */
  self.setOptions = function(opt: MapSettings): void {
    options = opt;
    addWorker(function() {
      map.setOptions(options);
      nextWorker();
    });
  };

  self.setDirectionsOptions = function(opts: DirectionSettings): void {
    generateRouteOptions = opts;
  };

  let generateRouteOptions: DirectionSettings | null = null;

  /**
   * Generate Route
   */
  self.generateRoute = function(opts?: DirectionSettings | null, noLoader?: boolean): GoogleMapInstance {
    opts = opts || generateRouteOptions;
    noLoader = noLoader || false;
    generateRouteOptions = opts;
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
    return self;
  };

  self.clearRoute = function(): GoogleMapInstance {
    addWorker(function() {
      directionsDisplay.setDirections({ routes: [] });
      nextWorker();
    });
    return self;
  };

  self.showMapSettings = function(callback?: (mapSettings: MapSettings, directionSettings: DirectionSettings) => void): void {
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
  self.setDirections = function(elem: HTMLElement): GoogleMapInstance {
    self.directionsHtmlElement = elem;
    const setDirectionsWorker = function() {
      directionsDisplay.setPanel(elem);
      nextWorker();
    };
    addWorker(setDirectionsWorker);
    return self;
  };

  function addEvents(mapInstance: any): void {
    let isMouseDown = false;
    let isCenterchanged = false;
    mapInstance.addListener("mousedown", function() {
      isMouseDown = true;
    });
    mapInstance.addListener("mouseup", function() {
      isMouseDown = false;
      if (isCenterchanged) {
        isCenterchanged = false;
        const center = self.map.getCenter();
        self.onCenterChanged({ lat: center.lat(), lng: center.lng() });
      }
    });

    mapInstance.addListener("center_changed", function() {
      if (isMouseDown) {
        isCenterchanged = true;
        return;
      }
      isCenterchanged = false;
      const center = self.map.getCenter();
      self.onCenterChanged({ lat: center.lat(), lng: center.lng() });
    });
    mapInstance.addListener("zoom_changed", function() {
      self.onZoomChanged(self.map.getZoom());
    });
  }

  self.getCenter = function(callback: (center: any) => void): GoogleMapInstance {
    addWorker(function() {
      callback(self.map.getCenter());
      nextWorker();
    });
    return self;
  };

  /**
   * Initialize map element
   */
  self.init = function(element: HTMLElement, opts?: MapSettings): GoogleMapInstance {
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

        self.map = map = new google.maps.Map(element, options);
        directionsDisplay = new google.maps.DirectionsRenderer(directionsRendererOptions);
        directionsService = new google.maps.DirectionsService;
        directionsDisplay.setMap(map);
        loader.hide();
        google.maps.event.trigger(map, 'resize');
        addEvents(self.map);
        nextWorker();
      }); //end GoogleMapsLoader
    }, true);
    setTimeout(() => {
      nextWorker(true);
    });
    return self;
  };

  self.startWorkers = function(): void {
    //nextWorker(true);
  };

  self.onWorkersFinished = function(): void {
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
  function addWorker(callback: () => void, addFirst: boolean = false): void {
    if (addFirst)
      wait.unshift(callback);
    else
      wait.push(callback);
    //start worker if supposed to start
    if (workerFinished) {
      workerFinished = false;
      nextWorker();
    }
    workersAdded = true;
  }

  return self;
}