export var Tabs = {
	activate: function(this_ctrl) {
		var ctrl = this_ctrl || this;

		var parent = ctrl.parentElement;
		var parent_id = ctrl.getAttribute("parent_id");
		if (parent_id != null ) {
			parent = document.getElementById(parent_id);
		}

		Tabs.hide_all(parent);
		Tabs.setActive(ctrl);
	},

	activate_by_id : function(id) {
		if (typeof id =='undefined') return;
		var t = document.getElementById(id);

		var parent = t.parentElement;
		var parent_id = t.getAttribute("parent_id");
		if (parent_id != null ) {
			parent = document.getElementById(parent_id);
		}

		var wasActive = this.isActive(t);

		Tabs.hide_all(parent);

		this.setActive(t);
	},
	hide_all:function(parent) {
		var all = parent.getElementsByTagName('div');
		var first = null;
		var activeFound = false;
		for (var n = 0; n < all.length; n++) {
			this.setInActive(all[n]);
		}

	},
	/** Initialize tabs
	 * @param {HTMLElement} id - the tab-buttons container
	 */
	init:function(tabButtons) {
		var parent = tabButtons.parentElement;
		var all = tabButtons.getElementsByTagName('div');
		var first = null;
		var activeFound = false;
		for (var n = 0; n < all.length; n++) {
			var ctrl = all[n];
			
			if (first ===null)
				first = ctrl;
			if (!empty( parent.querySelector('#'+ctrl.getAttribute('for')))){
				ctrl.addEventListener('click', function() {
					Tabs.activate(this);
				}, false);
			}
			
			if (!this.isActive(ctrl) )
				this.setInActive(ctrl);
			else{
				this.setActive(ctrl);
				activeFound = true;
			}

		}
		if (first !== null && !activeFound)
			this.activate(first);
	},
	isActive : function(el){
		return el.classList.contains('active') && el.getAttribute('active') !== null;
	},

	/** @param {HTMLElement} el */
	setActive : function(el){
		var parent = el.parentElement.parentElement;
		el.classList.add('active');
		el.setAttribute('active','');
		var tab = parent.querySelector('#'+el.getAttribute('for'));
		if (empty(tab))
			return;

		//tab.style.display="block";
		tab.classList.add('active');
	},
	/** @param {HTMLElement} el */
	setInActive : function(el){
		var parent = el.parentElement.parentElement;
		el.classList.remove('active');
		el.removeAttribute('active');

		var tab = parent.querySelector('#'+el.getAttribute('for'));
		if (empty(tab))
			return;
		//tab.style.display="none";
		tab.classList.remove('active');
		
	}
}
