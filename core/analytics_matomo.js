import { Objects } from "./Objects";

// Analytics 
export class Analytics {
  static get Event() {
    return {
      USERLOGIN: "Login",
      APPERROR: "App Error",
      LOADFILE: "Load File",
      APIERROR: "API Error",
      LOGINFAIL: "Login Failure"
    };
  }

  static get Page() {
    return {
      App: "Open App"
    };
  }

  //User properties that do not change during visit. Used for Segmenting users
  static get UserProperty() {
    return {
      USER_TYPE: "User_Type",
    };
  }
  //Action properties that change from order to order. Used for segmenting actions
  static get ActionProperty() {
    return {
      ORDER_BRANCH_NAME: "Branch_Name",
    };
  }
  //Not used at the moment because there is no way to segment by dimension
  static get Dimension() {
    return {
      Visit_AMC_Name: 1,
    };
  }
  /**
	 * Create Tracker instance
	 * @param {{SiteId:number, URL: string}} config 
	 */
  constructor(config) {
    this.config = config;

    //only init if device is initialized
    if (typeof window.device !== 'undefined') {
      this.Tracker = new Matomo(config.SiteId, config.URL);
    }

    this.PrevScreenName = null;

  }

  init() {
    this.Tracker = new Matomo(this.config.SiteId, this.config.URL);
  }

  /**
	 * Enable/Disable analytics collection
	 * @param {boolean} collectFlag 
	 */
  collectAnalytics(collectFlag) {
    this.Tracker.enable(collectFlag);
  }

  /**
	 * Set current page name
	 * @param {string} name 
	 * @param {string} optionalUrl
	 */
  setScreenName(name, optionalUrl = null) {
    this.Tracker.setScreenName(name);

    var url = optionalUrl ? optionalUrl : this.createPageURL(name);
    this.Tracker.setURL(url);
    this.Tracker.setRefURL(this.PrevScreenName);


    this.Tracker.send();
    this.PrevScreenName = url;

    return this;
  }

  setOutLink(url) {
    this.Tracker.setActionOpenLink(url);
    this.Tracker.send();
  }

  createPageURL(name){
    return "app://" + encodeURI( name );
  }

  markNewVisit() {
    this.Tracker.options.new_visit = 1;
  }

  /**
	 * @param {string|number} id
	 */
  setUserId(id) {
    this.Tracker.setUserId(String(id));
    return this;
  }
  /**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
  setUserProperty(propertyName, propertyValue) {
    switch (propertyName) {
      //here we can intercept properties
      default:
        this.Tracker.setUserProperty(propertyName, propertyValue);
    }
    return this;
  }
  /**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
  setActionProperty(propertyName, propertyValue) {
    this.Tracker.setActionProperty(propertyName, propertyValue);
    return this;
  }
  /**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
  setPersistentActionProperty(propertyName, propertyValue) {
    this.Tracker.setPersistentActionProperty(propertyName, propertyValue);
    return this;
  }

  /**
	 * 
	 */
  clearPersistentActionProperties() {
    this.Tracker.PersistentActionVar = {};
    return this;
  }


  /**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
  setVisitDimension(propertyName, propertyValue) {
    this.Tracker.setActionDimension(propertyName, propertyValue);
  }
  /**
	 * 
	 * @param {string|number} propertyName 
	 * @param {string|number} propertyValue 
	 */
  setActionDimension(propertyName, propertyValue) {
    this.Tracker.setActionDimension(propertyName, propertyValue);
  }
  /**
	 * Call after setting all user/visit related data
	 */
  logVisit() {
    this.Tracker.send();
    return this;
  }

  /**
	 * 
	 * @param {string|number} eventName 
	 * @param {any} eventValue 
	 */
  logEvent(eventName, eventValue = null) {
    //console.log("eventName",eventValue);
    if (eventName === null) {
      //if mapping is set to null then dont track
      return;
    }
    switch (eventName) {
      case Analytics.Event.SEARCH:
        this.Tracker.setActionSearch(eventValue.search_value, eventValue.result_count, eventValue.category_name);
        break;
      case Analytics.Event.LOADFILE:
        this.Tracker.setActionDownload(eventValue);
        break;
      case Analytics.Event.APPERROR:
        this.Tracker.setEvent("Error", eventName, eventValue);
        break;
      case Analytics.Event.APIERROR:
        this.Tracker.setEvent("Error", eventName, eventValue);
        break;
      case Analytics.Event.LOGINFAIL:
        this.Tracker.setEvent("Error", eventName, eventValue);
        break;
      //here we can intercept properties
      default:
        if (eventValue && typeof eventValue == 'object')
          eventValue = JSON.stringify(eventValue);
        this.Tracker.setEvent("Event", eventName, eventValue);
    }
    this.Tracker.send();
    return this;
  }
}


class Matomo {
  constructor(id, url) {
    //set properties
    this._URL = url;
    this._enabled = true;
    /**
		 * @type {MatomoTrackOptions}
		 */
    this.options = {
      url: null,
      idsite: id,
      rec: 1,
      apiv: 1,
      send_image: 0,
      new_visit: 1,
      res: window.screen.width + "x" + window.screen.height
    };

    this.ActionOpts = {};

    this.EventVar = {};

    this.UserVar = {
      OS: device ? device.platform : null,
      Model: device ? device.model : null,
    };

    this.ActionVar = {};
    this.ActionDimension = {};
    this.VisitDimension = {};

    this.PersistentActionVar = {};
  }

  enable(flag = true) {
    this._enabled = flag;
  }

  setScreenName(name) {
    this.options.action_name = name;
    return this;
  }
  setURL(name) {
    this.options.url = name;
    return this;
  }
  setRefURL(name) {
    this.options.urlref = name;
    return this;
  }

  /**
	 * 
	 * @param {number} ver 
	 */
  setAppVersion(ver) {
    this.UserVar.Version = ver;
    return this;
  }
  /**
	 * 
	 * @param {string} uid 
	 */
  setUserId(uid) {
    this.options.uid = uid;
    return this;
  }

  setUserProperty(user_property, property_value) {
    this.UserVar[user_property] = property_value;
  }

  setActionProperty(action_property, action_value) {
    this.ActionVar[action_property] = action_value;
  }

  setPersistentActionProperty(action_property, action_value) {
    this.PersistentActionVar[action_property] = action_value;
  }

  clearPersistentActionProperties() {
    this.PersistentActionVar = {};
  }

  setActionDimension(action_property, action_value) {
    this.ActionDimension["dimension" + action_property] = action_value;
  }

  setVisitDimension(action_property, action_value) {
    this.VisitDimension["dimension" + action_property] = action_value;
  }

  /**
	 * Ass Event tracking info
	 * @param {*} eventCategory The event category. Must not be empty. (eg. Videos, Music, Games...)
	 * @param {*} eventAction  The event action. Must not be empty. (eg. Play, Pause, Duration, Add Playlist, Downloaded, Clicked...)
	 * @param {*} [eventName]  The event name. (eg. a Movie name, or Song name, or File name...)
	 * @param {*} [eventValue] The event value. Must be a float or integer value (numeric), not a string.
	 */
  setEvent(eventCategory, eventAction, eventName = null, eventValue = null) {
    this.EventVar = {
      e_c: eventCategory,
      e_a: eventAction,
      e_n: eventName,
      e_v: eventValue
    };
  }

  setActionDownload(action_value) {
    this.ActionOpts.download = action_value;
    this.ActionOpts.url = action_value;
  }

  setActionOpenLink(action_value) {
    this.ActionOpts.link = action_value;
    this.ActionOpts.url = action_value;
  }

  setActionSearch(search_value, result_count = 0, category_name = null) {
    this.ActionOpts.search = search_value;
    this.ActionOpts.search_count = result_count;
    this.ActionOpts.search_cat = category_name;
  }

  /**
	 * Create JSON-encoded array from key-value pairs
	 * @param {KeyValuePair} cvarObj
	 * @return {string}
	*/
  _createCVAR(cvarObj) {

    var uv = Object.keys(cvarObj);
    var cv = {};
    for (var i = 0; i < uv.length; i++) {
      //if (cvarObj[uv[i]]!==null)
      cv[i + 1] = [uv[i], cvarObj[uv[i]]];
    }
    var ret = JSON.stringify(cv);
    return ret;
  }

  /**
	 * Send collected info to analytics.
	 * Resets the Action options
	 */
  send() {
    if (!this._enabled)
      return;
    if (!this._URL)
      return;
    //set up visit vars	
    this.options._cvar = this._createCVAR(this.UserVar);

    //set up event vars	
    this.options.cvar = this._createCVAR(Object.assign({}, this.ActionVar, this.PersistentActionVar));

    var payload = Object.assign({}, this.options, this.ActionOpts, this.EventVar, this.ActionDimension, this.VisitDimension);
    //clear action values right away to prevent another request picking them up before this one completes!
    this.clearActionValues();
    //console.log(pay);

    var formData = new FormData();

    Objects.forEach(payload, (value, key) => {
      formData.set(key, value);
    });

    this.makeRequest(formData);
  }

  /** @override */
  makeRequest(data){
    window.fetch(this._URL,
      {
        method: 'POST',
        //headers: new Headers([['Content-Type','application/json']]),
        mode: 'no-cors',
        body: data
      }).then((ret) => {
        //console.log("SPY OK");
      }).catch((err) => {
        //console.log("SPY Err:" + JSON.stringify(this._URL)+ JSON.stringify(payload) + JSON.stringify(err));
      });
  }
  /**
	 * Set new visit to 0
	 * Reset Action and Event parameters
	 */
  clearActionValues() {
    this.options.new_visit = 0;
    this.ActionVar = {};
    this.ActionOpts = {};
    this.EventVar = {};
    this.ActionDimension = {};
  }

}