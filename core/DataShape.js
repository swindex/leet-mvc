import { isArray, isFunction } from "util";
import { isObject } from "util";
import { Objects } from "leet-mvc/core/Objects";
import { isBoolean } from "util";

export var DataShape = {
	/** @return {number} */
	integer: (def) => 
		/** @return {null|number} */
		val => {
			typeof def =='undefined' ? def = null : null
			if (typeof val == 'undefined')	return def;
			var ret = parseInt(val);
			return isNaN(ret) ? def : ret;
		},
	/** @return {number} */
	float: (def) => 
		/** @return {null|number} */
		val => {
			typeof def =='undefined' ? def = null : null
			if (typeof val == 'undefined')	return def;
			var ret = parseFloat(val);
			return isNaN(ret) ? def : ret;
		},
	/** @return {boolean} */
	boolean: (def) => 
		/** @return {null|boolean} */
		val => {
			typeof def == 'undefined' ? def = null : null
			if (typeof val == 'undefined')	return def;
			if (isBoolean(val))
				return val;
			if (val==='f' || val==='false')
				return false;
			if (val==='t' || val==='true')
				return true;	
			var ret = Number(val);
			return isNaN(ret) ? def : ret !== 0;
		},	
	/** @return {string} */
	string:  (def) => 
		/** @return {null|string} */
		val => {
			typeof def =='undefined' ? def = null : null
			if (typeof val == 'undefined')	return def;

			return typeof val == 'undefined' || val == null ? def : val+'';
		},
	/** @return {Date} */
	date:(def) => 
		/** @return {null|Date} */
		val => {
			typeof def =='undefined' ? def = null : null
			if (typeof val == 'undefined')	return def;

			return new Date(val);
		},
	/**
	 * Copy object data using DataShape template
	 * @param {object} obj - object to create a copy of
	 * @param {object} [templateObject] - template object. shape of object that will be used for copying
	 * @param {boolean} [checkSource] - template object. shape of object that will be used for copying
	 * @param {string} [path] - internal path to property. passed within the function for proper error reporting
	 * @return {object}
	 */
	copy: function(obj, templateObject, checkSource,path){
		var undefined;
		path = path || "";
		checkSource = checkSource || false;
		templateObject = templateObject || obj;
		let newObj
		if (isArray(templateObject)){
			newObj = [];
			//fillup the template with its own first element
			if (isArray(obj))
				templateObject = Array.apply(null, Array(obj.length)).map(function(){return templateObject[0]});
			else
				templateObject=[];
		}else if (isObject(templateObject)){
			newObj = {};
		}else if (isFunction(templateObject)){
			return templateObject(obj);
		}else{				
			//if primitive, return as is
			if (typeof obj == 'undefined' && templateObject==null)
				return null
			return obj;
		}
		//copy object properties
		Objects.forEach(templateObject, (tEl,i)=>{
			if (obj && typeof obj[i] == 'undefined' && checkSource)
				throw new Error(`A Required Property ${i} of template${path} does not exist in source object${path}`);
			else{
				var e;
				if (!isObject(obj)){
					//console.log(`A Required Property ${i} of template${path} does not exist in source object${path}`,new Error().stack);
				}else{
					e = obj[i];
				}
				newObj[i] = DataShape.copy(e, tEl,checkSource, path + '.' + i);
			}
		});
		return newObj;
	},
}