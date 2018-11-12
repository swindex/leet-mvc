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
	}
}
