import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import "dayjs/locale/en";
import "dayjs/locale/fr";

import { empty } from "./helpers";
import { Translate } from "./Translate";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export var DateTime = {
  /**
	 * Return date in progressive string format. Used for display purposes ONLY
	 * @param {string|Date} [value] a Date object or parseable string, 
	 * @param {boolean} [outputOffset] - specify whether (UTC-xx:xx) timezone offset will be output. Defaults to false
	 * @returns {string}
	 */
  smartFormat(value, outputOffset ) {
    outputOffset = outputOffset || false;
    if (empty(value))
      return null;
    //dayjs.locale(this.GUser.settings.language);
		
    var now = dayjs();

    var date = dayjs(value);
    var offset = dayjs(value).utcOffset();
    var hasZone = value && (typeof value === 'string' && value.includes('T') && (value.includes('+') || value.includes('-') || value.includes('Z')));

    var sameZone = !hasZone ||  (hasZone && now.utcOffset() === date.utcOffset());

    var f ="";
		
    //Everything is the same - show time only	
    if (
      now.year() == date.year() &&
			now.month() == date.month() &&
			now.week() == date.week() &&
			now.day() == date.day()
    )
      f = "["+ Translate("Today") +"] LT";
		
    //Only Day of week is different	- show day of week and time
    if (
      now.year() == date.year() &&
			now.month() == date.month() &&
			now.week() == date.week() &&
			now.day() != date.day()
    )
      f = "dddd LT";

    //week is different - show month and date and time
    if (
      now.year() == date.year() &&
			now.month() == date.month() &&
			now.week() != date.week()
    )
      f = "MMM D LT";

    //month is different - show month and date and time
    if (
      now.year() == date.year() &&
			now.month() != date.month()
    )
      f = "MMM D LT";

    //year is different - show year and month and date and time
    if (
      now.year() != date.year()
    )
      f = "MMM D, YYYY LT";

    if ( outputOffset &&
			hasZone
    )
      f += " [(UTC]Z[)]";
	
    var ret = null;
    if ( hasZone && !sameZone )				
      ret = dayjs(value).utcOffset(offset).format(f);
    else	
      ret = dayjs(value).format(f);
			
    return ret;	
  },
  /**
	 * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
  formatLocalDate: function(__date) {
    if (__date == undefined || !dayjs(__date).isValid())
      return null;
    return dayjs(__date).format('YYYY-MM-DD HH:mm:ss');
  },
  /**
	 * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
  fromLocalDate: function(__date) {
    if (__date == undefined) return null;
    
    let parsed;
    if (typeof __date === 'string') {
      // Try parsing as local date format first
      parsed = dayjs(__date, 'YYYY-MM-DD HH:mm:ss');
      if (!parsed.isValid()) {
        // Try default parsing
        parsed = dayjs(__date);
      }
    } else {
      // Handle Date object
      parsed = dayjs(__date);
    }
    
    if (!parsed.isValid()) return null;
    
    return parsed.toISOString();
  },
  /**
	 * Return date in human- readable format.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
  toHumanDate: function(__date) {
    if (__date == undefined || !dayjs(__date).isValid())
      return null;
		
    return dayjs(__date).format('LL');
  },

  /**
	 * convert date from human format to date.
	 * @param {string} __date a parseable string, 
	 * @returns {Date}
	 */
  fromHumanDate: function(__date) {
    if (__date == undefined) return null;
    
    // Try multiple date formats that are commonly used
    const formats = [DateTime._humanDate, 'LL', 'MMM DD, YYYY', 'MMM D, YYYY', 'MMMM DD, YYYY', 'MMMM D, YYYY'];
    
    for (let format of formats) {
      const parsed = dayjs(__date, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    
    // Try default parsing as fallback
    const defaultParsed = dayjs(__date);
    if (defaultParsed.isValid()) {
      return defaultParsed.toDate();
    }
    
    return null;
  },
  /**
	 * Return time in human- readable format.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
  toHumanTime: function(__date) {
    if (__date == undefined || !dayjs(__date).isValid())
      return null;
		
    return dayjs(__date).format(DateTime._humanTime);
  },
  /**
	 * Return convert readable format to date
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {Date}
	 */
  fromHumanTime: function(__date) {
    if (__date == undefined) return null;
    
    // Try multiple time formats
    const timeFormats = [DateTime._humanTime, 'LT', 'HH:mm', 'H:mm', 'h:mm A', 'h:mm a', 'HH:mm:ss', 'H:mm:ss'];
    
    for (let format of timeFormats) {
      const parsed = dayjs(__date, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    
    // Try default parsing as fallback
    const defaultParsed = dayjs(__date);
    if (defaultParsed.isValid()) {
      return defaultParsed.toDate();
    }
    
    return null;
  },
	
  /**
	 * convert date from human format to date.
	 * @param {string} __date a parseable string, 
	 * @returns {Date}
	 */
  fromHumanDateTime: function(__date) {
    if (__date == undefined) return null;
    
    // Try multiple datetime formats
    const dateTimeFormats = [
      DateTime._humanDateTime, 'LLLL', 
      'dddd, MMMM D, YYYY h:mm A', 'dddd, MMMM DD, YYYY h:mm A',
      'MMMM D, YYYY h:mm A', 'MMMM DD, YYYY h:mm A',
      'MMM D, YYYY h:mm A', 'MMM DD, YYYY h:mm A',
      'dddd, MMMM D, YYYY HH:mm', 'dddd, MMMM DD, YYYY HH:mm',
      'MMMM D, YYYY HH:mm', 'MMMM DD, YYYY HH:mm',
      'MMM D, YYYY HH:mm', 'MMM DD, YYYY HH:mm'
    ];
    
    for (let format of dateTimeFormats) {
      const parsed = dayjs(__date, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    
    // Try default parsing as fallback
    const defaultParsed = dayjs(__date);
    if (defaultParsed.isValid()) {
      return defaultParsed.toDate();
    }
    
    return null;
  },
  /**
	 * Return date in human- readable format.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
  toHumanDateTime: function(__date) {
    if (__date == undefined || !dayjs(__date).isValid())
      return null;	
    return dayjs(__date).format(DateTime._humanDateTime);
  },
	
  /**
	 * Return date in specified format
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @param {string} [format] - defaults to MM/DD/YYYY
	 * @returns {string}
	 */
  toFormat(__date, format){
    format = format || DateTime._humanMMDDYYYY;
    if (__date == undefined || !dayjs(__date).isValid())
      return null;
    return dayjs(__date).format(format);
  },


  moment: dayjs,

  toJSONDate: function(__date){
    if (__date == undefined || !dayjs(__date).isValid())
      return null;
		
    return dayjs(__date).format(DateTime._JSONDate);
  },

  fromJSONDate: function(__date){
    if (__date == undefined || !dayjs(__date).isValid())
      return null;
    return dayjs(__date,DateTime._JSONDate);
  },

  /**
	 * Return Device Date-Time
	 */
  fromJSONDeviceDate: function(__date){
    if (__date == undefined || !dayjs(__date).isValid())
      return null;
    var v = dayjs(__date,DateTime._JSONDate).utc().format('LLLL');	
    var v2= dayjs(v,'LLLL');
    return v2;
  },

  /**
	 * 
	 * @param {Date} date 
	 * @param {Date} time 
	 */
  combineDateTime(date, time){
    var time_m = dayjs(time);
    var cH = time_m.hour();
    var cM = time_m.minute();
    var cS = time_m.second();

    var date_m = dayjs(date);
    date_m = date_m.hour(cH);
    date_m = date_m.minute(cM);
    date_m = date_m.second(cS);

    return date_m.toDate();
  },

  setLocale(lang){
    dayjs.locale(lang);
  },

  _humanTime:"LT",
  _humanDateTime:"LLLL",
  _humanDate:"LL",
  _JSONDate:'YYYY-MM-DD[T]HH:mm:ssZ',
  _humanMMDDYYYY:"MM/DD/YYYY",
};
