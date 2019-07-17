import { isString } from "util";

export var Text = {
	escapeHTML:function(unsafe, convertNewlines) {
		unsafe = isString(unsafe) ? unsafe : "";
		convertNewlines = convertNewlines || false;
		return unsafe
			 .replace(/&/g, "&amp;")
			 .replace(/</g, "&lt;")
			 .replace(/>/g, "&gt;")
			 .replace(/"/g, "&quot;")
			 .replace(/'/g, "&#039;")
			 .replace(/\n/g, convertNewlines ? "<br />" : '');
	},
	/**
	 * Format phone number while typing
	 * @param {string} text - phone number to format
	 * @param {object} [mask] - default: { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' };
	 */
	formatPhone: function(text, mask) {
		var numbers = text.replace(/\D/g, '');
		mask = mask || { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' };
		text = '';
		for (var i = 0; i < numbers.length; i++) {
			text += (mask[i] || '') + numbers[i];
		}
		return text;
	},

	/**
	 * Get File Extension (without DOT)
	 * @param {string} fName
	 * @return {string}
	 */
	fileExtension: function(fName){
		fName = fName || "";
		var li = fName.lastIndexOf('.');
		if (li < 0 || li >= fName.length)
			return "";
		return fName.substr(li+1);
	},

	/**
	 * Get File Name.Extension
	 * @param {string} fName
	 * @return {string}
	 */
	fileFullName: function(fileName){
		fileName = fileName || "";
		if (!fileName || !isString(fileName)){
			return "";
		}
		return fileName.split(/\\|\//).pop();
	},

	/**
	 * Join file path bits making sure there is / between them and no duplicates
	 * @param {string[]} args
	 */
	joinPath: function(...args){
		var path = "";
		args.forEach((el)=>{
			if (path.split('').pop()=='/' && el.split('').shift()=='/')
				path = path + el.substr(1);
			else	
				path = path + el;
			
		});
		return path;
	}
}
