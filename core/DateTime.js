import * as moment from "moment";
import { Translate } from "leet-mvc/core/Translate";

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
		//moment.locale(this.GUser.settings.language);
		
		var now = moment();

		var date = moment(value);
		var offset = moment.parseZone(value).utcOffset();
		var hasZone = typeof date._tzm !=='undefined';

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
			ret = moment(value).utcOffset(offset).format(f);
		else	
			ret = moment(value).format(f);
			
		return ret;	
	},
	/**
	 * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
	formatLocalDate: function(__date) {
		if (__date !== undefined && !moment(__date).isValid())
			return null;
		return moment(__date).format('YYYY-MM-DD HH:mm:ss');
	},
		/**
	 * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
	fromLocalDate: function(__date) {
		if (__date !== undefined && !moment(__date).isValid())
			return null;
		return moment(__date,'YYYY-MM-DD HH:mm:ss').toISOString();
	},
	/**
	 * Return date in human- readable format.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
	toHumanDate: function(__date) {
		if (__date !== undefined && !moment(__date).isValid())
			return null;
		
		return moment(__date).format('LL');
	},
	/**
	 * convert date from human format to date.
	 * @param {string} __date a parseable string, 
	 * @returns {Date}
	 */
	fromHumanDate: function(__date) {
		if (__date !== undefined && !moment(__date, DateTime._humanDate).isValid())
			return null;
		return moment(__date, DateTime._humanDate).toDate();
	},
	/**
	 * convert date from human format to date.
	 * @param {string} __date a parseable string, 
	 * @returns {Date}
	 */
	fromHumanDateTime: function(__date) {
		if (__date !== undefined && !moment(__date,DateTime._humanDateTime).isValid())
			return null;
		return moment(__date,DateTime._humanDateTime).toDate();
	},
	/**
	 * Return date in human- readable format.
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @returns {string}
	 */
	toHumanDateTime: function(__date) {
		if (__date !== undefined && !moment(__date).isValid())
			return null;	
		return moment(__date).format(DateTime._humanDateTime);
	},
	
	/**
	 * Return date in specified format
	 * @param {string|Date} __date a Date object or parseable string, 
	 * @param {string} [format] - defaults to MM/DD/YYYY
	 * @returns {string}
	 */
	toFormat(__date, format){
		format = format || DateTime._humanMMDDYYYY;
		if (__date !== undefined && !moment(__date).isValid())
			return null;
		return moment(__date).format(format);
	},


	moment: moment,

	toJSONDate: function(__date){
		if (__date !== undefined && !moment(__date).isValid())
			return null;
		
		return moment(__date).format(DateTime._JSONDate);
	},

	fromJSONDate: function(__date){
		if (__date !== undefined && !moment(__date).isValid())
			return null;
		return moment(__date,DateTime._JSONDate);
	},

	/**
	 * Return Device Date-Time
	 */
	fromJSONDeviceDate: function(__date){
		if (__date !== undefined && !moment(__date).isValid())
			return null;
		var v = moment(__date,DateTime._JSONDate).parseZone().format('LLLL');	
		var v2= moment(v,'LLLL');
		return v2;
	},

	setLocale(lang){
		moment.locale(lang);
	},

	_humanDateTime:"LLLL",
	_humanDate:"LL",
	_JSONDate:'YYYY-MM-DD[T]HH:mm:ssZ',
	_humanMMDDYYYY:"MM/DD/YYYY",
}