import { isObject } from "util";
import { isArray } from "util";

export const Objects = {
	filter : function (data,callback){
		var table = new Array();
		var ok=0;

		for (var key in data){
			if (! data.hasOwnProperty(key)) continue;	
				//check if out row using callback
			var elem=data[key];
			if (elem!=null && callback(elem, key)) {
				//copy all fields into our array
				table.push(elem);
			}


		}
		return table;
	},
	find : function (data,callback){
		for (var key in data){
			if (! data.hasOwnProperty(key)) continue;	
				//check if out row using callback
			var elem=data[key];
			if (elem!=null && callback(elem, key)) {
				//copy all fields into our array
				return elem;
			}
		}
	},
	/**
	 * cycle through objects in an array
	 */
	forEach : function (data,callback){
		var table = new Array();
		var ok=0;

		for (var key in data){
			if (! data.hasOwnProperty(key)) continue;	
				//check if out row using callback
			var ret = callback(data[key], key);	
			if (ret === false) 
				return;
		}
	},

	keyBy: function(array, columnName){
		var ret = {};
		for (var k in array){
			ret[array[k][columnName]] = array[k];
		}
		return ret;
	},

	/**
	 * Set Object properties to null. 
	 * @param {*} obj 
	 */
	clear: function(obj){
		if (isObject(obj)){
			Objects.forEach(obj, (el,i)=>{
				if (!isObject(el))
					obj[i]=null;
				else	
					Objects.clear(el)
			});
		}else{
			obj = null;
		}
	},
	
	/**
	 * Copy object data 
	 * @param {object} obj - object to create a copy of
	 * @param {object} [templateObject] - template object. shape of object that will be used for copying
	 * @param {boolean} [checkSource] - template object. shape of object that will be used for copying
	 * @return {object}
	 */
	copy: function(obj, templateObject, checkSource,path){
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
		}else{
			//if primitive, return as is
			return obj;
		}
		//copy object properties
		Objects.forEach(templateObject, (tEl,i)=>{
			if (obj && typeof obj[i] !=='undefined')
				newObj[i] = Objects.copy(obj[i],tEl,checkSource,path + '.' + i);
			else{
				if (checkSource)
					throw new Error(`A Required Property ${i} of template${path} does not exist in source object${path}`);
				else
					//console.log(`A Required Property ${i} of template${path} does not exist in source object${path}`);	
				newObj[i] = Objects.copy(null,tEl,checkSource,path + '.' + i);
			}
		});
		return newObj;
	},
	/**
	 * Get object property using path
	 * @param {*} obj 
	 * @param {string[]|string} pathArray 
	 * @return {any}
	 */
	getPropertyByPath(obj, pathArray){
		if (typeof pathArray == 'string'){
			pathArray = pathArray.split('.');
		}

		if (pathArray.length>1)
			return Objects.getPropertyByPath(obj[pathArray.shift()],pathArray);
		else
			return obj[pathArray.shift()]
	},
	/**
	 * Get object property using path
	 * @param {*} obj 
	 * @param {string[]|string} pathArray 
	 * @param {any} value
	 */
	setPropertyByPath(obj, pathArray, value){
		if (typeof pathArray == 'string'){
			pathArray = pathArray.split('.');
		}

		if (pathArray.length>1)
			Objects.setPropertyByPath(obj[pathArray.shift()],pathArray, value);
		else
			obj[pathArray.shift()] = value;
	},
		/**
	 * Get object property using path
	 * @param {*} obj 
	 * @param {string[]|string} pathArray 
	 * @param {any} value
	 */
	deletePropertyByPath(obj, pathArray){
		if (typeof pathArray == 'string'){
			pathArray = pathArray.split('.');
		}

		if (pathArray.length>1)
			Objects.deletePropertyByPath(obj[pathArray.shift()],pathArray);
		else
			delete obj[pathArray.shift()];
	}
}