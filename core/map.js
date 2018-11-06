import  GoogleMapsLoader from 'google-maps';
import { Loader } from '../pages/Loader/Loader';
import { tryCall } from './helpers';
import { Dialog } from './../pages/DialogPage/DialogPage';
import { Translate } from './Translate';

/** Wrapper for google Maps API*/
/**
 * Create an instance of map
 * @param {string} API_KEY 
 * @param {string} API_VERSION 
 */
export var Map = function(API_KEY,API_VERSION,LANGUAGE){
	/**@type {Map} */
	var self = this;
	/** @type {GoogleMapsLoader.google} */
	var google=null;
	/** @type {google.maps.MapOptions} */
	var options = {};
	/** @type {google.maps.Map} */
	var map = null;
	/** @type {google.maps.LatLng} */
	var start = null;
	/** @type {google.maps.LatLng} */
	var end = null;
	/** @type {string} */
	var endText = null;
	/**@type {google.maps.Marker} */
	var endMarker=null;
	/**@type {google.maps.Marker} */
	var startMarker=null;

	var markers = [];

	/** @type {google.maps.DirectionsRenderer} */
	var directionsDisplay = null;
	/** @type {google.maps.DirectionsService} */
	var directionsService = null;

	/** @type {HTMLElement} */
	var mapHtmlElement = null;
	/** @type {HTMLElement} */
	var directionsHtmlElement = null;

	/** @type {google.maps.DirectionsRendererOptions} */
	var directionsRendererOptions ={
			suppressMarkers: false,
			preserveViewport: true
	}

	GoogleMapsLoader.KEY = API_KEY;
	GoogleMapsLoader.VERSION = API_VERSION;
	GoogleMapsLoader.LANGUAGE = LANGUAGE;
	var wait = [];

	this.getLocation = getLocation;
	function getLocation(Latitude, Longitude){
		return new google.maps.LatLng(Number(Latitude), Number(Longitude));
	}


	/**
	 * Set End Address
	 * @param {number} Latitude 
	 * @param {number} Longitude 
	 */
	this.setEndLocation = function(Latitude, Longitude){
		if (!Latitude || !Longitude || isNaN(Latitude) || isNaN(Longitude))
			return false;
		addWorker(function(){
			end = new google.maps.LatLng(Number(Latitude), Number(Longitude));
			nextWorker();
		});
		return this;
	}
	var positionTimer = null;
	this.watchStartPosition = function() {
		addWorker(function(){
			if (startMarker!=null){
				positionTimer = navigator.geolocation.watchPosition(
					function (position) {
						if (empty(start) || start.lat().toFixed(4)!= position.coords.latitude.toFixed(4) || start.lng().toFixed(4) != position.coords.longitude.toFixed(4)){
							self.setStartLocation(position.coords.latitude,position.coords.longitude);
							startMarker.setPosition(getLocation(position.coords.latitude,position.coords.longitude));
							self.generateRoute(null, true);
						}
					},
					null,
					{maximumAge:5000,enableHighAccuracy:false}
				);
			}
			nextWorker();
		});
	}
	this.destroy=function(){
		if ( positionTimer!==null )
			navigator.geolocation.clearWatch(positionTimer);
	}

	/**
	 * Set start to current GPS location
	 */
	this.setStartGps = function(resolve, reject){
		addWorker(function(){
			var loader = Loader().container(mapHtmlElement.parentElement).timeout(5000).show(Translate("Acquiring GPS.."));
			navigator.geolocation.getCurrentPosition(function success(pos){
				loader.hide();
				start = new google.maps.LatLng(Number(pos.coords.latitude), Number(pos.coords.longitude));
				tryCall(null,resolve,start);
				nextWorker();
			}, function fail(err){
				loader.hide();
				console.log("unable to acquire GPS", err);
				tryCall(null,reject, err);
				nextWorker();
			}, {maximumAge:3000, timeout:5000, enableHighAccuracy:true});
		});
		return this;
	}
	/**
	 * Set End Location
	 * @param {number} Latitude 
	 * @param {number} Longitude
	 */
	this.setStartLocation = function(Latitude, Longitude){
		addWorker(function(){
			start = new google.maps.LatLng(Number(Latitude), Number(Longitude));
			nextWorker();
		});	
		return this;
	}
	/**
	 * Set End Text
	 * @param {string} text 
	 */
	this.setEndText = function(text){
		endText = text;
		return this;
	}
	/**
	 * Set Start Text
	 * @param {string} text 
	 */
	this.setStartText = function(text){
		endText = text;
		return this;
	}
	/**
	 * Center on End location
	 */
	this.centerEnd = function(){
		addWorker(function(){
			if (!empty(end))
				map.setCenter(end);
			nextWorker();
		});
		return this;
	}
	/**
	 * Center on Start location
	 */
	this.centerStart = function(){
		addWorker(function(){
			if (!empty(start))
				map.setCenter(start);
			nextWorker();
		});
		return this;
	}
	/**
	 * Center on location
	 */
	this.centerOn = function(location){
		addWorker(function(){
			if (!empty(location))
				map.setCenter(location);
			nextWorker();
		});
		return this;
	}
	/**
	 * Set Destination location by its string address
	 * @param {string} address 
	 * @param {function(google.maps.LatLng)} [callback]
	 */
	this.setEndAddress = function(address, callback){
		addWorker(function(){
			var geocoder = new google.maps.Geocoder();
			if (geocoder) {
					var loader = Loader().container(mapHtmlElement.parentElement).timeout(5000).show();
					geocoder.geocode( { 'address': address}, function(results, status) {
						loader.hide();
						if (status == google.maps.GeocoderStatus.OK) {
							if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
								end = results[0].geometry.location;
								if (typeof callback ==='function')
									callback(end);
							}else{
								console.log('Error: No results found!');
							}
						} else{
							console.log('Geocode was not successful for the following reason: '+status);
						}
						nextWorker();
					});
			}else
				nextWorker();
		});
		return this;
	}

	/**
	 * Display End Marker
	 * @param {string} [imageURI] - image to display
	 */
	this.showEndMarker = function(imageURI){
		directionsRendererOptions.suppressMarkers = true;
		addWorker(function(){
			if (!empty(endMarker))
				endMarker.setMap(null);
			endMarker = setMarker(end,imageURI);
			nextWorker();
		});
		//if (empty(google)) wait.push(v); else v();

		return this;
	}
	/**
	 * Display Start marker
	 * @param {string} [imageURI] - image to display
	 */
	this.showStartMarker = function(imageURI){
		directionsRendererOptions.suppressMarkers = true;

		addWorker(function(){
			if (!empty(startMarker))
				startMarker.setMap(null);
			startMarker = setMarker(start, imageURI);
			nextWorker();
		});
		//if (empty(google)) wait.push(v); else v();

		return this;
	}

	/**
	 * Create marker on map
	 * @param {google.maps.LatLng} location 
	 * @param {string} imageURI 
	 * @param {string} label 
	 */
	function setMarker(location,imageURI){
		//imageURI = imageURI || 'img/marker.png';
		if (empty(location))
			return null;
		var marker = new google.maps.Marker({
			position: location,
			map: map, 
			//title: getDetailAddress(),
			icon: imageURI
		});
		return marker;
	}

	/**
	 * Create marker on map within worker
	 * @param {number} lat 
	 * @param {number} lng 
	 * @param {string} imageURI 
	 * @param {function(google.maps.Marker)} [onClick] 
	 */
	this.setMarker = function(lat, lng, imageURI, onClick){
		addWorker(function(){
			var marker = new google.maps.Marker({
				position: getLocation(lat, lng),
				map: map, 
				icon: imageURI
			});
			marker.addListener('click', function(e){event.preventDefault(); onClick(this);});
			markers.push(marker);
			nextWorker();
		});
		return this;
	}

	/**
	 * Set Map Options
	 * @param {APIDATA['settings']['map_settings']} opt
	 */
	this.setOptions = function(opt){
		options = opt;
		addWorker(function(){
			map.setOptions(options);
			nextWorker();
		});	
	}

	this.setDirectionsOptions = function(options){
		generateRouteOptions = options;
	}

	var generateRouteOptions = null;
	/**
	 * Generate Route
	 * @param {APIDATA['settings']['directions_settings']} [opts]
	 * @param {boolean} [noLoader] - hide loader
	 */
	this.generateRoute = function(opts, noLoader){
		opts = opts || generateRouteOptions;
		noLoader = noLoader || false;
		generateRouteOptions = opts;
		addWorker(function(){
			if (empty(start)){
				directionsHtmlElement.innerHTML=`<div class="error">Unable to get directions: Your loaction is missing</div>`;
				nextWorker();
			}else if (empty(end)){
				directionsHtmlElement.innerHTML=`<div class="error">Unable to get directions: Destination loaction is missing</div>`;
				nextWorker();
			}else{
				if (!noLoader)
					var loader = Loader().container(directionsHtmlElement.parentElement).timeout(5000).show();
				directionsService.route($.extend({
						origin: start,
						destination: end,
						travelMode: google.maps.TravelMode.DRIVING
						
				},opts), function(response, status) {
					if (status === google.maps.DirectionsStatus.OK) {
						directionsDisplay.setDirections(response);
					}
					if (!noLoader)
						loader.hide();
					nextWorker();
				});
			}
		});
		//if (empty(google)) wait.push(v); else v();
		return this;
	}
	this.showMapSettings = function(callback){
		var map_settings = options;
		var directions_settings = generateRouteOptions;
		
		var d = Dialog(Translate("Map Settings"));

		d.addCheck('disableDefaultUI',Translate('Show Map Controls'),!map_settings.disableDefaultUI);
		
		if (directionsHtmlElement){
			d.addSelect("travelMode", Translate('Travel Mode'),directions_settings.travelMode, null,[
				{value:'DRIVING',title:Translate("Driving")},
				{value:'BICYCLING',title:Translate("Bicycling")},
				{value:'TRANSIT' ,title:Translate("Transit")},
				{value:'WALKING' ,title:Translate("Walking")},
			]);

			d.addSelect('unitSystem',Translate('Map Units'),Number(directions_settings.unitSystem), null,[
				{value:0, title:Translate("Metric")},
				{value:1, title:Translate("Imperial")},
			]);

			d.addCheck("avoidTolls", Translate('Avoid Tolls'),directions_settings.avoidTolls);
			d.addCheck("avoidHighways",Translate('Avoid Highways'),directions_settings.avoidHighways);
			d.addCheck("avoidFerries", Translate('Avoid Ferries'),directions_settings.avoidFerries);
			d.addCheck("provideRouteAlternatives", Translate('Provide route alternatives'),directions_settings.provideRouteAlternatives);
		}
		d.addActionButton("Cancel",function(){});
		d.addActionButton("Ok",function(){
			var res = d.data;

			if (directionsHtmlElement){
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
			map_settings = {
				disableDefaultUI:  !res.disableDefaultUI,
			}

			self.setOptions(map_settings);

			tryCall(null, callback, map_settings, directions_settings);
			
		});
	}
	/**
	 * Set Directions container element
	 * @param {HTMLElement} elem 
	 */
	this.setDirections = function(elem){
		var setDirections = function(){
			directionsHtmlElement = elem;
			directionsDisplay.setPanel(elem);
			nextWorker();
		}
		addWorker(setDirections);
		//if (empty(google)) wait.push(v); else v();
		return this;
	}

	/**
	 * Initialize map element
	 * @param {HTMLElement} element 
	 * @param {google.maps.MapOptions} [opts]
	 * @returns {Map}
	 */
	this.init = function(element, opts){

		opts ? options = opts : null;

		mapHtmlElement = element;

		addWorker(function(){
			var loader = Loader().container(element.parentElement).timeout(5000).show();
			
			GoogleMapsLoader.load(function(_google) {
				google = _google;

				options = $.extend({
					zoom: 12,
					center:  new google.maps.LatLng(10, 10),
					mapTypeControlOptions : {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
					mapTypeId : google.maps.MapTypeId.ROADMAP,
				},options);

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
	}
	this.startWorkers= function(){
		nextWorker(true);
	}
	this.onWorkersFinished = function(){

	}
	var workerFinished = false;
	var workerStarted = false;
	var workersAdded = false;
	/**
	 * Run next worker.
	 * @param {true} [start] - true to signal start of the queue
	 */
	function nextWorker(start){
		start = start || null;
		if (start===true)
			workerStarted = true;
		
		if (workerStarted===true && wait.length>0){
			wait.shift()();
		} else if (workerStarted===true){
			self.onWorkersFinished();
			workerFinished = true;	
		}
		
	}
	/**
	 * Add worker to queue.
	 * @param {function} callback - add function to the end of the queue
	 */
	function addWorker(callback){
		wait.push(callback);
		//start worker if supposed to start
		if (workerFinished){ 
			workerFinished = false;
			nextWorker();
		}
		workersAdded = true;
	}
}
//"Acquiring GPS..":"Acquiring GPS..",
//"Map Settings":"Map Settings",
//'Show Map Controls':'Show Map Controls',
//'Travel Mode':'Travel Mode',
//"Driving":"Driving",
//"Bicycling":"Bicycling",
//"Transit":"Transit",
//"Walking":"Walking",
//'Map Units':'Map Units',
//"Metric":"Metric",
//"Imperial":"Imperial",
//'Avoid Tolls':'Avoid Tolls',
//'Avoid Highways':'Avoid Highways',
//'Avoid Ferries':'Avoid Ferries',
//'Provide route alternatives':'Provide route alternatives',