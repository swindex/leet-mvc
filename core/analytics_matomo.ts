import { Objects } from "./Objects";

declare global {
  interface Window {
    device?: {
      platform: string;
      model: string;
    };
  }
}

interface AnalyticsConfig {
  SiteId: number;
  URL: string;
}

interface MatomoTrackOptions {
  url: string | null;
  idsite: number;
  rec: number;
  apiv: number;
  send_image: number;
  new_visit: number;
  res: string;
  action_name?: string;
  urlref?: string | null;
  _ref?: string;
  uid?: string;
  _cvar?: string;
  cvar?: string;
}

// Analytics
export class Analytics {
  static get Event() {
    return {
      USERLOGIN: "Login",
      APPERROR: "App Error",
      LOADFILE: "Load File",
      APIERROR: "API Error",
      LOGINFAIL: "Login Failure",
      SEARCH: "Search"
    } as const;
  }

  static get Page() {
    return {
      App: "Open App"
    } as const;
  }

  // User properties that do not change during visit. Used for Segmenting users
  static get UserProperty() {
    return {
      USER_TYPE: "User_Type",
    } as const;
  }

  // Action properties that change from order to order. Used for segmenting actions
  static get ActionProperty() {
    return {
      ORDER_BRANCH_NAME: "Branch_Name",
    } as const;
  }

  // Not used at the moment because there is no way to segment by dimension
  static get Dimension() {
    return {
      Visit_AMC_Name: 1,
    } as const;
  }

  private config: AnalyticsConfig;
  private Tracker!: Matomo;
  private PrevScreenUrl: string | null = null;
  private PrevScreenName: string | null = null;

  /**
   * Create Tracker instance
   */
  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  /** Create tracker instance */
  init(): void {
    this.Tracker = new Matomo(this.config.SiteId, this.config.URL);
  }

  /**
   * Enable/Disable analytics collection
   */
  collectAnalytics(collectFlag: boolean): void {
    this.Tracker.enable(collectFlag);
  }

  /**
   * Set current page name
   */
  setScreenName(name: string, optionalUrl: string | null = null): this {
    if (this.PrevScreenName === name) {
      return this;
    }

    this.Tracker.setScreenName(name);

    const url = optionalUrl ? optionalUrl : this.createPageURL(name);
    this.Tracker.setURL(url);
    this.Tracker.setRefURL(this.PrevScreenUrl);

    this.Tracker.send();
    this.PrevScreenUrl = url;
    this.PrevScreenName = name;

    return this;
  }

  setOutLink(url: string): void {
    this.Tracker.setActionOpenLink(url);
    this.Tracker.send();
  }

  createPageURL(name: string): string {
    return "app://" + encodeURI(name);
  }

  markNewVisit(): void {
    this.Tracker.options.new_visit = 1;
  }

  setUserId(id: string | number): this {
    this.Tracker.setUserId(String(id));
    return this;
  }

  setUserProperty(propertyName: string | number, propertyValue: string | number): this {
    switch (propertyName) {
      default:
        this.Tracker.setUserProperty(propertyName, propertyValue);
    }
    return this;
  }

  setActionProperty(propertyName: string | number, propertyValue: string | number): this {
    this.Tracker.setActionProperty(propertyName, propertyValue);
    return this;
  }

  setPersistentActionProperty(propertyName: string | number, propertyValue: string | number): this {
    this.Tracker.setPersistentActionProperty(propertyName, propertyValue);
    return this;
  }

  clearPersistentActionProperties(): this {
    this.Tracker.PersistentActionVar = {};
    return this;
  }

  setVisitDimension(propertyName: string | number, propertyValue: string | number): void {
    this.Tracker.setActionDimension(propertyName, propertyValue);
  }

  setActionDimension(propertyName: string | number, propertyValue: string | number): void {
    this.Tracker.setActionDimension(propertyName, propertyValue);
  }

  /**
   * Call after setting all user/visit related data
   */
  logVisit(): this {
    this.Tracker.send();
    return this;
  }

  logEvent(eventAction: string | null, eventName: any = "", eventValue: any = ""): this {
    if (eventAction === null) {
      return this;
    }
    switch (eventAction) {
      case Analytics.Event.SEARCH:
        this.Tracker.setActionSearch(eventName.search_value, eventName.result_count, eventName.category_name);
        break;
      case Analytics.Event.LOADFILE:
        this.Tracker.setActionDownload(eventName);
        break;
      case Analytics.Event.APPERROR:
        this.Tracker.setEvent("Error", eventAction, eventName, eventValue);
        break;
      case Analytics.Event.APIERROR:
        this.Tracker.setEvent("Error", eventAction, eventName, eventValue);
        break;
      case Analytics.Event.LOGINFAIL:
        this.Tracker.setEvent("Error", eventAction, eventName, eventValue);
        break;
      default:
        if (eventName && typeof eventName === 'object')
          eventName = JSON.stringify(eventName);
        this.Tracker.setEvent("Event", eventAction, eventName, eventValue);
    }
    this.Tracker.send();
    return this;
  }
}

class Matomo {
  private _URL: string;
  private _enabled: boolean = true;
  options: MatomoTrackOptions;
  private ActionOpts: Record<string, any> = {};
  private EventVar: Record<string, any> = {};
  private UserVar: Record<string, any>;
  private ActionVar: Record<string, any> = {};
  private ActionDimension: Record<string, any> = {};
  private VisitDimension: Record<string, any> = {};
  PersistentActionVar: Record<string, any> = {};

  constructor(id: number, url: string) {
    this._URL = url;

    this.options = {
      url: null,
      idsite: id,
      rec: 1,
      apiv: 1,
      send_image: 0,
      new_visit: 1,
      res: window.screen.width + "x" + window.screen.height
    };

    this.UserVar = {
      OS: window.device ? window.device.platform : null,
      Model: window.device ? window.device.model : null,
    };

    console.log("Device:", window.device);
  }

  enable(flag: boolean = true): void {
    this._enabled = flag;
  }

  setScreenName(name: string): this {
    this.options.action_name = name;
    return this;
  }

  setURL(name: string): this {
    this.options.url = name;
    return this;
  }

  setRefURL(name: string | null): this {
    this.options.urlref = name;
    return this;
  }

  setReferrerURL(name: string): this {
    this.options._ref = name;
    return this;
  }

  setAppVersion(ver: number | string): this {
    this.UserVar.Version = ver;
    return this;
  }

  setUserId(uid: string): this {
    this.options.uid = uid;
    return this;
  }

  setUserProperty(user_property: string | number, property_value: string | number): void {
    this.UserVar[user_property] = property_value;
    console.log(user_property, property_value);
  }

  setActionProperty(action_property: string | number, action_value: string | number): void {
    this.ActionVar[action_property] = action_value;
  }

  setPersistentActionProperty(action_property: string | number, action_value: string | number): void {
    this.PersistentActionVar[action_property] = action_value;
  }

  clearPersistentActionProperties(): void {
    this.PersistentActionVar = {};
  }

  setActionDimension(action_property: string | number, action_value: string | number): void {
    this.ActionDimension["dimension" + action_property] = action_value;
  }

  setVisitDimension(action_property: string | number, action_value: string | number): void {
    this.VisitDimension["dimension" + action_property] = action_value;
  }

  /**
   * Add Event tracking info
   * @param eventCategory The event category. Must not be empty. (eg. Videos, Music, Games...)
   * @param eventAction The event action. Must not be empty. (eg. Play, Pause, Duration, Add Playlist, Downloaded, Clicked...)
   * @param eventName The event name. (eg. a Movie name, or Song name, or File name...)
   * @param eventValue The event value. Must be a float or integer value (numeric), not a string.
   */
  setEvent(eventCategory: string, eventAction: string, eventName: string | null = null, eventValue: any = null): void {
    this.EventVar = {
      e_c: eventCategory,
      e_a: eventAction,
      e_n: eventName,
      e_v: eventValue
    };
  }

  setActionDownload(action_value: string): void {
    this.ActionOpts.download = action_value;
    this.ActionOpts.url = action_value;
  }

  setActionOpenLink(action_value: string): void {
    this.ActionOpts.link = action_value;
    this.ActionOpts.url = action_value;
  }

  setActionSearch(search_value: string, result_count: number = 0, category_name: string | null = null): void {
    this.ActionOpts.search = search_value;
    this.ActionOpts.search_count = result_count;
    this.ActionOpts.search_cat = category_name;
  }

  /**
   * Create JSON-encoded array from key-value pairs
   */
  private _createCVAR(cvarObj: Record<string, any>): string {
    const uv = Object.keys(cvarObj);
    const cv: Record<number, [string, any]> = {};
    for (let i = 0; i < uv.length; i++) {
      cv[i + 1] = [uv[i], cvarObj[uv[i]]];
    }
    return JSON.stringify(cv);
  }

  /**
   * Send collected info to analytics.
   * Resets the Action options
   */
  send(): void {
    if (!this._enabled)
      return;
    if (!this._URL)
      return;

    this.options._cvar = this._createCVAR(this.UserVar);
    this.options.cvar = this._createCVAR(Object.assign({}, this.ActionVar, this.PersistentActionVar));

    const payload = Object.assign({}, this.options, this.ActionOpts, this.EventVar, this.ActionDimension, this.VisitDimension);
    this.clearActionValues();

    const formData = new FormData();

    Objects.forEach(payload, (value: any, key: string | number) => {
      formData.set(String(key), value);
    });

    this.makeRequest(formData);
  }

  /** @canoverride */
  makeRequest(data: FormData): void {
    window.fetch(this._URL,
      {
        method: 'POST',
        mode: 'no-cors',
        body: data
      }).then((ret) => {
        // console.log("SPY OK");
      }).catch((err) => {
        console.error(err);
      });
  }

  /**
   * Set new visit to 0
   * Reset Action and Event parameters
   */
  clearActionValues(): void {
    this.options.new_visit = 0;
    this.ActionVar = {};
    this.ActionOpts = {};
    this.EventVar = {};
    this.ActionDimension = {};
  }
}