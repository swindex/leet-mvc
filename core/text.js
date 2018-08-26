export var Text = {
	escapeHTML:function(unsafe) {
		return unsafe
			 .replace(/&/g, "&amp;")
			 .replace(/</g, "&lt;")
			 .replace(/>/g, "&gt;")
			 .replace(/"/g, "&quot;")
			 .replace(/'/g, "&#039;");
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
	}
}
