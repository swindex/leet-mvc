import { isObject } from "util";
import { isArray } from "util";

export const Objects = {
	filter : function (data,callback){
		var ret
		if(isObject(data) || !isArray(data)){
			ret = new data.constructor;
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

//DefType(type, default, mutator)
/**
	ServiceFeeIncreases:{
		data:[
			{
				feeIncrease_id: DefType('number',parseInt),
				dateTime:  DefType('dateTime',parseInt),
				comment:null,
				status: null,
				items:[
					{
						feeType:null,
						title:null,
						fee:null,
						currency:null
					}
				]
			}
		]
	}
 */
//class DefType