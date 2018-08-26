export var Storage = {
	set: function (key, value, callback){
		var str = JSON.stringify({value: value});
		window.localStorage.setItem(key, str);
		if (typeof callback ==='function')
			callback();
		return value;	
	},

	get: function (key, defaultValue, callback){
		defaultValue = typeof defaultValue==='undefined' ? null : defaultValue;
		
		var str = window.localStorage.getItem(key);
		var value = defaultValue;
		if (str!==null){
			try{
				value = (JSON.parse(str)).value;
			}catch(err){
				console.log('Error extracting key '+ key +" from Storage", err );
			}
		}
		if (typeof callback ==='function')
			callback(value);	
		return value;	
	},
	update:function(key, obj, callback){
		var oldData = null;
		if (typeof obj ==='object'){
			oldData = this.get(key,{});
			for (var k in obj){
				if (!obj.hasOwnProperty(k)) continue;
				oldData[k] = obj[k];
			}
		}else{
			oldData = obj;
			
		}
		this.set(key, oldData, callback);
		return oldData;
	},
	delete: function (key, callback){
		window.localStorage.removeItem(key);
		if (typeof callback ==='function')
			callback();
	},
	clear: function (callback){
		window.localStorage.clear();
		if (typeof callback ==='function')
			callback();
	},

}