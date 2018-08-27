import { BaseComponent } from "connexions/src/js/BaseComponent";
//import './SwiperTabs.scss';
/**
 * Simple tabs directive. 
 */
export class SimpleTabs{
	constructor(){
		/** @type {HTMLElement} */
		this.container = null;
		/** @type {DocumentFragment} */
		this.tempContainer = null;

	}

	onTabChanged(index){

	}

	unSelectAll(){
		var self = this;
		$(this.container).find('li').each(function(){
			var t = $(this);
			self.getTab(t).removeAttr('selected');
			t.removeAttr('selected')}
		);
	}

	getTab(target){
		var tab_id = $(target).attr('for');
		return $(target).closest('.page').find('#'+tab_id);
	}

	select(target){
		$(target).attr('selected','');
		this.getTab(target).attr('selected','');
	}
	
	init(container){

		this.container = $(container);
		$(container).find('li').on('click',(ev)=>{
			var t = ev.currentTarget;
			if (this.getTab(t).length>0){
				this.unSelectAll();
				this.select(t);
			}else{
				$(t).attr('selected','');
				setTimeout(()=>{
					$(t).removeAttr('selected');
				},500);
			}

		})	
		var sel = $(container).find('li[selected]').get(0);
		this.unSelectAll();
		if (sel)
			this.select(sel);
		else
			this.select($(container).find('li').first());
	}
}