import { isObject, isString } from "util";
import { isArray } from "util";

export const Objects = {
	filter : function (data,callback){
		var ret
		if(isObject(data) && !isArray(data)){
			ret = {} //new data.constructor;
			for (var key in data){
				if (! data.hasOwnProperty(key)) continue;	
					//check if out row using callback
				var elem=data[key];
				if (elem!=null && callback(elem, key)) {
					//copy all fields into our array
					ret[key] = elem;
				}
			}
		}else if(isArray(data)){
			ret = [];
			for (var key in data){
				if (! data.hasOwnProperty(key)) continue;	
					//check if out row using callback
				var elem=data[key];
				if (elem!=null && callback(elem, key)) {
					//copy all fields into our array
					ret.push(elem);
				}
			}
		}
		return ret;	
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

		if (isArray(data)){
			for (var i =0; i < data.length; i ++){
				if (callback(data[i], i) === false) 
					return;
			}
		}else{
			for (var key in data){
				if (! data.hasOwnProperty(key)) continue;	
					//check if out row using callback
				if (callback(data[key], key) === false) 
					return;
			}
		}
	},

	keyBy: function(array, columnName, columnNames){
		var ret = {};
		for (var k in array){
			if (!array.hasOwnProperty(k)) continue;
			if (!columnNames)
				ret[array[k][columnName]] = array[k];
			else{
				if (isString(columnNames)){
					ret[array[k][columnName]] = array[k][columnNames];
				}else if (isArray(columnNames)){
					var r = {};
					Objects.forEach(columnNames,function(cn){
						r[cn]=array[k][cn];
					});
					ret[array[k][columnName]] = r;
				}

			}	
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
	 * owerwrite object, preserving reference 
	 * @param {*} obj 
	 */
	overwrite: function(obj, src){
		if (!isObject(obj)){
			return src;
		}
		if (isObject(src)){
			if (!isObject(obj)){
				obj = src;
			}else{
				if (obj instanceof Date){
					obj = src;
				}else{
					if (isArray(src) && isArray(obj)){
						//if both are arrays: make them the same length
						obj = obj.slice(0,src.length-1);

					}else {
						//if one or both are not arrays, remove keys from target that are not in source
						var keys = [];
						for(var i in src){
							keys.push(i);
						}
						for(var i in obj){
							if (keys.indexOf(i)<0){
								delete obj[i];
								//console.log("delete key", i);
							}
						}

					}
					for(var i in src){
						//ONLY assign shallow: that is enough for change detection!
						obj[i]=src[i];
					}
				}
			}

		}else{
			obj = src;
		}
		return obj;
	},

	/**
	 * Copy object, breaking reference 
	 * @param {*} obj 
	 */
	copy: function(src){
		if (!isObject(src)){
			return src;
		}
		var obj;
		if (src instanceof Date)
			return new Date(src.getTime())
		else{
			if (isArray(src))
				obj = [];
			else
				obj = {}

			for(var i in src){
				obj[i] = Objects.copy(src[i]);
			}
		}
		return obj;
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