//Firebase Analytics 
export class Analytics {
	static get Event() {return {
		USERLOGIN:"Login",
		USERLOGOUT:"Logout",
		USERAUTOLOGIN: null,
		LOGINFAIL:"LOGINFAIL",
		
		APPERROR:"APPERROR",
		APIERROR:"APIERROR",
		SEARCH:"SEARCH",
		ORDER_OPEN:"Order Details",
		LOADFILE:"LOADFILE",
		EDITFEE:"Edit Fee",
		SETAPPOINTMENT: "Set Appointment",
		NOTE_ADDED:"Note Added",
		NOTES_VIEWED:"Notes Viewed",
		PHONE_CALL:"Make Call",
		SMS_TEXT:"Send Text",
		EDIT_MAPSETTINGS:"Edit Map Settings",
		LAUNCH_NAVIGATOR:"Navigator Launch",
		SETTINGS_SAVED:"Save User Settings",
		FCM_START: null
	}};
	static get Page() {return {
		App :"Open App",
		DashboardPage :"Dashboard",
		OrdersPage :"Orders List",
		WelcomePage : null,
		
		LoginPage:"Login Page",
		RequestPage :"Order Details",
		DialogPageGenerator: null,
		SearchPage:'Search Results',
		Notes :"Notes Page",
		CallPhone :null,
		SettingsPage : "Settings Page",
	}};
	//User properties that do not change during visit. Used for Segmenting users
	static get UserProperty() {return{
		USER_TYPE: "User_Type",
		USER_NAME: "User_Name",
	}}
	//Action properties that change from order to order. Used for segmenting users
	static get ActionProperty() {return{
		LENDER_NAME: "Lender_Name",
		ORDER_ID: "Order_ID",
		ORDER_BRANCH_NAME: "Branch_Name",
		ORDER_SCHEMA: "Schema_Name",
		ORDER_AMC_NAME: "Order_AMC_Name",
		ORDER_AMC_ID: "Order_AMC_ID"
	}}
	//Not used at the moment because there is no way to segment by dimension
	static get Dimension() {return{
		Visit_AMC_Name: 1,
		Action_AMC_Name: 2,
	}}
	/**
	 * Create Tracker instance
	 * @param {{SiteId:number, URL: string}} config 
	 */
	constructor(config){
		this.config = config;

		//only init if device is initialized
		if (typeof device !== 'undefined')
			this.Tracker = new Matomo(config.SiteId,config.URL);
		
		this.PrevScreenName = null;

	}

	init(){
		//
		this.Tracker = new Matomo(this.config.SiteId,this.config.URL);
	}

	/**
	 * Enable/Disable analytics collection
	 * @param {boolean} collectFlag 
	 */
	collectAnalytics (collectFlag){
		this.Tracker.enable(collectFlag);
	}

	/**
	 * Set current page name
	 * @param {string} name 
	 * @param {string} optionalUrl
	 */
	setScreenName (name, optionalUrl=null){

		//use page mapping to get the proper name for analytics
		if (Analytics.Page[name] === null){
			//if mapping is set to null then dont track
			return;
		}else{
			//else get a new name
			name = Analytics.Page[name];
		}
			

		this.Tracker.setScreenName(name);
		
		var url = optionalUrl ? optionalUrl : name;
		this.Tracker.setURL(url);
		this.Tracker.setRefURL(this.PrevScreenName);


		this.Tracker.send();
		this.PrevScreenName = url;
		
		return this;
	}

	markNewVisit(){
		this.Tracker.options.new_visit = 1;
	}

	/**
	 * @param {string|number} id
	 */
	setUserId (id){
		this.Tracker.setUserId(String(id));
		return this;
	}
	/**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
	setUserProperty (propertyName, propertyValue){
		switch (propertyName){
			//here we can intercept properties
			default:
				this.Tracker.setUserProperty(propertyName,propertyValue);
		}
		return this;
	}
	/**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
	setActionProperty (propertyName, propertyValue){
		this.Tracker.setActionProperty(propertyName,propertyValue);
		return this;
	}
	/**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
	setPersistentActionProperty (propertyName, propertyValue){
		this.Tracker.setPersistentActionProperty(propertyName,propertyValue);
		return this;
	}

	/**
	 * 
	 */
	clearPersistentActionProperties (){
		this.Tracker.PersistentActionVar = {};
		return this;
	}


	/**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
	setVisitDimension (propertyName, propertyValue){
		this.Tracker.setActionDimension(propertyName, propertyValue);
	}
	/**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
	setActionDimension (propertyName, propertyValue){
		this.Tracker.setActionDimension(propertyName, propertyValue);
	}
	/**
	 * Call after setting all user/visit related data
	 */
	logVisit(){
		this.Tracker.send();
		return this;
	}

	/**
	 * 
	 * @param {string|number} eventName 
	 * @param {any} eventValue 
	 */
	logEvent (eventName, eventValue = null){
		//console.log("eventName",eventValue);
		if (eventName === null){
			//if mapping is set to null then dont track
			return;
		}
		switch (eventName){
			case Analytics.Event.SEARCH:
				this.Tracker.setActionSearch(eventValue.search_value, eventValue.result_count, eventValue.category_name);
				break;
			case Analytics.Event.LOADFILE:
				this.Tracker.setActionDownload(eventValue);
				break;
			case Analytics.Event.APPERROR:
				this.Tracker.setEvent("Error",eventName,eventValue);
				break;
			case Analytics.Event.APIERROR:
				this.Tracker.setEvent("Error",eventName, eventValue);
				break;
			case Analytics.Event.LOGINFAIL:
				this.Tracker.setEvent("Error",eventName, eventValue);
				break;	
			//here we can intercept properties
			default:
				this.Tracker.setEvent("Event", eventName, eventValue);
		}
		this.Tracker.send();
		return this;
	}
}


class Matomo {
	constructor(id, url){
		//set properties
		this._URL = url;
		this._enabled = true;
		/**
		 * @type {MatomoTrackOptions}
		 */
		this.options ={
			url: null,
			idsite : id,
			rec : 1,
			apiv: 1,
			send_image:0,
			new_visit : 1,
			res : window.screen.width + "x" + window.screen.height
		};

		this.ActionOpts = {};

		this.EventVar={};

		this.UserVar ={
			OS:  device ? device.platform : null,
			Model:device ? device.model : null,
			Version: null
		}
	
		this.ActionVar ={};
		this.ActionDimension ={};
		this.VisitDimension = {};

		this.PersistentActionVar = {};
	}

	enable(flag=true){
		this._enabled= flag;
	}

	setScreenName(name){
		this.options.action_name = name;
		return this;
	}
	setURL(name){
		this.options.url = name;
		return this;
	}
	setRefURL(name){
		this.options.urlref = name;
		return this;
	}

	/**
	 * 
	 * @param {number} ver 
	 */
	setAppVersion(ver){
		this.UserVar.Version = ver;
		return this;
	}
	/**
	 * 
	 * @param {string} uid 
	 */
	setUserId(uid){
		this.options.uid = uid
		return this;
	}

	setUserProperty(user_property, property_value){
		this.UserVar[user_property] = property_value;
	}

	setActionProperty(action_property, action_value){
		this.ActionVar[action_property] = action_value;
	}

	setPersistentActionProperty(action_property, action_value){
		this.PersistentActionVar[action_property] = action_value;
	}

	clearPersistentActionProperties(){
		this.PersistentActionVar = {};
	}

	setActionDimension(action_property, action_value){
		this.ActionDimension["dimension"+action_property] = action_value;
	}

	setVisitDimension(action_property, action_value){
		this.VisitDimension["dimension"+action_property] = action_value;
	}

	/**
	 * Ass Event tracking info
	 * @param {*} eventCategory The event category. Must not be empty. (eg. Videos, Music, Games...)
	 * @param {*} eventAction  The event action. Must not be empty. (eg. Play, Pause, Duration, Add Playlist, Downloaded, Clicked...)
	 * @param {*} [eventName]  The event name. (eg. a Movie name, or Song name, or File name...)
	 * @param {*} [eventValue] The event value. Must be a float or integer value (numeric), not a string.
	 */
	setEvent(eventCategory , eventAction, eventName = null, eventValue = null){
		this.EventVar={
			e_c:eventCategory,
			e_a:eventAction,
			e_n:eventName,
			e_v:eventValue
		}
	}

	setActionDownload(action_value){
		this.ActionOpts.download = action_value;
		this.ActionOpts.url = action_value
	}

	setActionOpenLink(action_value){
		this.ActionOpts.link = action_value;
		this.ActionOpts.url = action_value
	}

	setActionSearch(search_value, result_count = 0, category_name = null){
		this.ActionOpts.search = search_value;
		this.ActionOpts.search_count = result_count;
		this.ActionOpts.search_cat = category_name;
	}

	/**
	 * Create JSON-encoded array from key-value pairs
	 * @param {KeyValuePair} cvarObj
	 * @return {string}
	*/
	_createCVAR(cvarObj){

		var uv = Object.keys(cvarObj);
		var cv = {};
		for (var i=0; i<uv.length; i++){
			if (cvarObj[uv[i]]!==null)
				cv[i]=[uv[i],cvarObj[uv[i]]];
		}
		var ret = JSON.stringify( cv );	
		return ret;
	}

	/**
	 * Send collected info to analytics.
	 * Resets the Action options
	 */
	send(){
		if (!this._enabled)
			return;
		//set up visit vars	
		this.options._cvar = this._createCVAR(this.UserVar);
		
		//set up event vars	
		this.options.cvar = this._createCVAR( $.extend({},this.ActionVar,this.PersistentActionVar ));

		var payload = $.extend({}, this.options,this.ActionOpts, this.EventVar, this.ActionDimension, this.VisitDimension);
		//clear action values right away to prevent another request picking them up before this one completes!
		this.clearActionValues();
		//console.log(pay);
		$.post(this._URL, payload ,null, 'json')
			.done((ret)=>{
				//console.log("SPY OK");
			}).fail((err)=>{
				//console.log("SPY Err:" + JSON.stringify(this._URL)+ JSON.stringify(payload) + JSON.stringify(err));
			});
	}
	/**
	 * Set new visit to 0
	 * Reset Action and Event parameters
	 */
	clearActionValues(){
		this.options.new_visit = 0;
		this.ActionVar = {};
		this.ActionOpts = {};
		this.EventVar = {};
		this.ActionDimension = {};
	}

}