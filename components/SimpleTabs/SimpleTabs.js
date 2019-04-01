import { BaseComponent } from "./../BaseComponent";
import './SimpleTabs.scss';
/**
 * Simple tabs directive. 
 */
export class SimpleTabs extends BaseComponent{
	constructor(){
		super();
		/** @type {HTMLElement} */
		this.container = null;
		/** @type {DocumentFragment} */
		this.tempContainer = null;
		this._currentTabLabel = null;
	}

	/**
	 * ***Override*** Called when tab is changed
	 * @param {string} tabLabel 
	 */
	onTabChanged(tabLabel){

	}

	_unSelectAll(){
		var self = this;
		$(this.container).find('li').each(function(){
			var t = $(this);
			self._getTab(t).removeAttr('selected');
			t.removeAttr('selected')}
		);
	}

	/** @param {HTMLElement} elem */
	_getTabLabel(elem){
		return $(elem).attr('for');
	}

	_getTab(target){
		var tab_id = this._getTabLabel(target);
		return this.container.find('#'+tab_id);
	}

	_select(target){
		var label = this._getTabLabel(target);
		if (this._currentTabLabel !== label){
			this._currentTabLabel = label;
			this.onTabChanged( label );
		}
		this._currentTabLabel = label;

		$(target).attr('selected','');
		this._getTab(target).attr('selected','');
	}

	select(forLabel){
		if (this.container){
			var t = this.container.find("[for='"+ forLabel+"']");
			if (t.length==1){
				this._unSelectAll();
				this._select(t);
			}
		}
	}

	setTabVisibility(forLabel, isVisible){
		if (this.container){
			var t = this.container.find("[for='"+ forLabel+"']");
			if (t.length==1){
				if (!isVisible)
					t.hide();
				else
					t.show();
			}
		}
	}
	
	init(container){
		super.init(container);
		this.container = $(container);
		$(container).find('li').on('click',(ev)=>{
			var t = ev.currentTarget;
			if (this._getTab(t).length>0){
				this._unSelectAll();
				this._select(t);
			}else{
				$(t).attr('selected','');
				setTimeout(()=>{
					$(t).removeAttr('selected');
				},500);
			}

		})	
		var sel = $(container).find('li[selected]').get(0);
		this._unSelectAll();
		if (sel)
			this._select(sel);
		else
			this._select($(container).find('li').first());
	}
}