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

	}

	onTabChanged(index){

	}

	_unSelectAll(){
		var self = this;
		$(this.container).find('li').each(function(){
			var t = $(this);
			self._getTab(t).removeAttr('selected');
			t.removeAttr('selected')}
		);
	}

	_getTab(target){
		var tab_id = $(target).attr('for');
		return $(target).closest('div[page]').find('#'+tab_id);
	}

	_select(target){
		$(target).attr('selected','');
		this._getTab(target).attr('selected','');
	}

	select(forLabel){
		if (this.container){
			var t = this.container.find(`[for='${forLabel}']`);
			if (t.length==1){
				this._unSelectAll();
				this._select(t);
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