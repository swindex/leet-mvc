import { DialogPage } from "./../DialogPage/DialogPage";
import { SimpleTabs } from "./../../components/SimpleTabs/SimpleTabs";
import { Confirm } from "./../../core/simple_confirm";
import { MapElement } from "./../../core/MapElement.js"; 

// @ts-ignore
import img_house from './m_house.png';
import './DirectionsPage.scss'
import { Translate } from "./../../core/Translate";

//var Inject = Injector.implement(InjectTemplate)
//Google maps leak memory as hell. Cache the map element, so at least we do not do it every time we load the page
/** @type {MapElement} */
var map = null;

export class DirectionsPage extends DialogPage{
	/**
	 * 
	 * @param {*} p 
	 * @param {{isShowPropertyDirections: boolean, language: string, lat: number,lng: number,address: string, API:{ KEY: string, VERSION: string, Location:{lat: number,lng: number}}, map_settings:{}, direction_settings : {}}} options 
	 */
	constructor(p, options){
		super(p);
		this.options = {
			isShowPropertyDirections: false,
			language:null,
			lat: null,
			lng: null,
			address: null,
			API: {
				KEY : null,
				VERSION : '3.34',
				Location: { lat: 43.46098192313348, lng: -80.5188529417726 }
			},
			directions_settings : {
				travelMode: 'DRIVING',
				unitSystem: 0,
				avoidTolls: false,
				avoidHighways: false,
				avoidFerries: false,
				provideRouteAlternatives: false
			},
			map_settings: {disableDefaultUI: false}
		}
		$.extend(this.options, options);
		
		this.mapTabs = new SimpleTabs();
		this.content = template;

		this.title = Translate("Property Directions");

		this.buttons = {
			Close: null
		}
	}

	init(){
		var maph = Math.floor($(window).innerHeight()/1.75);
		if ( maph < 205 )
			maph= 205;
		$('#map-tabs').css('height', maph);
	}

	onLoaded(){
		this.initMap();
	}
	initMap(){
		if (!map){
			map = new MapElement(this.options.API.KEY, this.options.API.VERSION, this.options.language);
			map.init($('#mapDiv')[0]); 
			map.setDirectionsOptions(this.options.directions_settings);
			map.setOptions(this.options.map_settings);
			
			map.centerOn(this.options.API.Location);
			if (this.options.isShowPropertyDirections) {
				map.setStartGps();
			}

			map.setDirections($('#directionsDiv')[0]);
			map.startWorkers();
		}else{
			$('#mapDiv').replaceWith(map.mapHtmlElement);
			$('#directionsDiv').replaceWith(map.directionsHtmlElement);
			
			if (this.options.isShowPropertyDirections) {
				map.setStartGps();
			}	
			map.clearRoute(); 
		}

		if (!map.setEndLocation(this.options.lat, this.options.lng)){
			map.setEndAddress(this.options.address);
		}
		map.centerEnd();

		if (this.options.isShowPropertyDirections){
			map.generateRoute();
			//default markers will be used
		}else{
			map.showEndMarker(img_house);	
		}
	}
	onUpdated(){

		if (this.options.isShowPropertyDirections)
			this.mapTabs.setTabVisibility("directions", true);
		else	
			this.mapTabs.setTabVisibility("directions", false);
		this.mapTabs.update();
	}
	onDestroy(){		
		if (map)
			map.destroy();
		$('#mapDiv').detach();	
	};
	onMapSettingsButtonClicked(){
		map.showMapSettings((map_settings,directions_settings)=>{
			this.onUpdatedMapSettings(map_settings, directions_settings);
			if (this.options.isShowPropertyDirections){
				map.generateRoute(directions_settings);
			}
		});
	}
	onNavigationButtonClicked(){
		Confirm(Translate('Launch default navigation app?'), ()=>{
			this.onLaunchedNavigator(this.options.address); 
			//Inject.SPY.logEvent(Analytics.Event.LAUNCH_NAVIGATOR, {order_id:this.options.appraisal_id});
			var addr= encodeURIComponent(this.options.address);
			if (window['device'] && window['device'].platform.toLowerCase() == 'ios'){
				window.open("http://maps.apple.com/?q="+ addr, '_system', 'location=yes') 
			}else{
				window.open("https://www.google.com/maps/dir/?api=1&destination="+addr, "_system",'location=yes' );
			}
		}, Translate('Navigation'));
	}

	/**
	 * ***Overwrite***
	 * @param {object} map_settings 
	 * @param {object} directions_settings 
	 */
	onUpdatedMapSettings(map_settings, directions_settings){
		console.log("Override me: onUpdatedMapSettings");
	}
	/**
	 * ***Overwrite***
	 * @param {string} address 
	 */
	onLaunchedNavigator(address){
		console.log("Override me: onUpdatedMapSettings");
	}
}
DirectionsPage.selector = "page-DirectionsPage";
var template =`
<div class = "map_container n_nicole" [directive]="this.mapTabs">
	<div id="map-tabs" class="tabs">
		<div class="tab swiper-no-swiping" id="map">
			<div class="fill" id="mapDiv"></div>
		</div>
		<div class="tab scroll fill" id="directions">
			<div class="fill" id="directionsDiv"></div>
		</div>
	</div>
	<ul id="tab-buttons" class="tab-buttons">
		<li for="map">
			<i class="fas fa-map"></i>
			<span>{{ Translate('Map') }}</span>
		</li>
		<li for="directions">
			<i class="fas fa-compass"></i>
			<span>{{ Translate('Directions') }}</span>
		</li>
		<li bind onclick="this.onMapSettingsButtonClicked()">
			<i class="fas fa-cog"></i>
			<span>{{ Translate('Settings') }}</span>
		</li>
		<li bind onclick="this.onNavigationButtonClicked()">
			<i class="fas fa-location-arrow"></i>
			<span>{{ Translate('Navigation') }}</span>
		</li>
	</ul>
</div>
`