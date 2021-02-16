import { isArray, isFunction, isObject, isBoolean } from "./helpers";
import { Objects } from "./Objects";

var ANY_KEY = Symbol("__KEY__");
export var DataShape = {
  ANY_KEY: ANY_KEY,
  /** @return {number} */
  integer: (def) => 
  /** @return {null|number} */
    val => {
      typeof def =='undefined' ? def = null : null;
      if (typeof val == 'undefined')	return def;
      var ret = parseInt(val);
      return isNaN(ret) ? def : ret;
    },
  /** @return {number} */
  float: (def) => 
  /** @return {null|number} */
    val => {
      typeof def =='undefined' ? def = null : null;
      if (typeof val == 'undefined')	return def;
      var ret = parseFloat(val);
      return isNaN(ret) ? def : ret;
    },
  /** @return {boolean} */
  boolean: (def) => 
  /** @return {null|boolean} */
    val => {
      typeof def == 'undefined' ? def = null : null;
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
      typeof def =='undefined' ? def = null : null;
      if (typeof val == 'undefined')	return def;

      return typeof val == 'undefined' || val == null ? def : val+'';
    },
  /** @return {Date} */
  date:(def) => 
  /** @return {null|Date} */
    val => {
      typeof def =='undefined' ? def = null : null;
      if (typeof val == 'undefined')	return def;

      return new Date(val);
    },
  /**
	 * Copy object data using DataShape template
	 * @param {object} obj - object to create a copy of
	 * @param {object} [templateObject] - template object. shape of object that will be used for copying
	 * @param {boolean|1} [checkSource] - false - no error reporting (default); true - Throw errors; 1 - Throw warnings
	 * @param {string} [path] - internal path to property. passed within the function for proper error reporting
	 * @return {object}
	 */
  copy: function(obj, templateObject, checkSource,path){
    path = path || "";
    checkSource = checkSource || false;
    //templateObject = templateObject || obj;
    let newObj;
    if (isArray(templateObject)) {
      //speacial handling of array template
      newObj = [];
      //simply apply the first element of the template array to each element in the object array!
      if (isArray(obj)) {
        Objects.forEach(obj, (objEl, i)=>{
          newObj[i] = DataShape.copy(objEl, templateObject[0], checkSource, path + '.' + i);
        });
        return newObj;
      } else {
        templateObject=[];
      }
    } else if (isObject(templateObject)) {
      newObj = {};
      //if the template object contains ANY_KEY property, implement the template value to each key of the corresponding source object property
      if (templateObject.hasOwnProperty(ANY_KEY) && obj !== null && obj !== undefined) {
        Object.keys(obj).forEach(function(key){
          //Only assign dynamic key template if the template object does not yet have the same key present
          if (!templateObject.hasOwnProperty(key)) {
            newObj[key] = DataShape.copy(obj[key], templateObject[ANY_KEY], checkSource, path + '.' + key);		
          }
        });
      }
    } else if (isFunction(templateObject)) {
      return templateObject(obj);
    } else {				
      //if primitive, return as is
      if (typeof obj == 'undefined' && templateObject===null)
        return null;
      return obj;
    }
    //copy object properties
    Objects.forEach(templateObject, (tEl,i)=>{
      if (obj && typeof obj[i] == 'undefined' && checkSource===true) {
        throw new Error(`A Required Property ${i} of template${path} does not exist in source object${path}`);
      } else {
        var e;
        if (!isObject(obj)) {
          if (checkSource === 1){
            console.warn(`A Required Property ${i} of template${path} does not exist in source object${path}`,new Error().stack);
          }
        } else {
          e = obj[i];
        }
        newObj[i] = DataShape.copy(e, tEl , checkSource, path + '.' + i);
      }
    });
    return newObj;
  },
};