import { isString } from "leet-mvc/core/helpers";
import { empty } from "./helpers";

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
   * Safely convert to string. Null or undefined convert to an empty string
   * @param {any} val 
   */
  toString(val){
    if (val == null) val = "";
    return String(val);
  },

  /**
   * Safely lower-case a string
   * @param {any} val 
   */
  toLowerCase(val){
    return Text.toString(val).toLowerCase();
  },

  /**
	 * Format phone number while typing
	 * @param {string} text - phone number to format
	 * @param {object} [mask] - default: { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' };
	 */
  formatPhone: function(text, mask) {
    if (text == null)
      text = "";
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
	 * Get File Name without Extension
	 * @param {string} fName
	 * @return {string}
	 */
  fileName: function(fileName){
    fileName = fileName || "";
    if (!fileName || !isString(fileName)){
      return "";
    }
    return fileName.split(/\\|\//).pop().split('.').shift();
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
  },

  /**
	 * Capitalize text
	 * @param {string} value 
	 */
  capitalize(value){
    if (empty(value)) return "";
    value = value+"";
    return (value.toLowerCase()).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  }
};
