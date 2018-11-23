import './OptionsDialogPage.scss';
import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { isObject } from 'util';
import { Objects } from 'leet-mvc/core/Objects';

export class OptionsDialogPage extends DialogPage{
	constructor(page){
		super(page);

		/** @type {{[x: string]: any,image?:string,icon?:string,title:string}[]} */
		this.items=[];
		this.content = `
			<ul>
				<li [foreach]="index in this.items as item" onclick="this._onItemClicked(item, index)" [selected] = "this.isSelectedItem(item)" [attribute]="{disabled:this.isDisabledItem(item) ? '' : null}">
					<i [class] = "this.getIcon(item)" [if]="this.getIcon(item)"></i>
					<img bind = "item.image" [if]="item.image" />
					<span [innerHTML] = "item.title"></span>
				</li>
			</ul>
		`;

		this.buttons = {
			"Cancel":()=>{this.onCancelClicked()},
		}

		this.icons = {
			selected: 'fas fa-circle',
			deselected: 'far fa-circle',
			disabled: '',
		}

		this.multiple = false;
		
	} 

	/**
	 * @param {boolean} value
	 */
	set multiple (value){
		this._multiple = value;
		if (value==true){
			this.buttons['Ok'] = ()=>{this._onOkClicked()}
		}else{
			this.buttons['Ok'] = undefined;
		}
	}

	/**
	 * @return {boolean}
	 */
	get multiple (){
		return this._multiple;
	}

	onLoaded(){
		//Scroll to the selected item
		if(this.page.find('[selected]').length>0 && this.page.find('[selected]')[0].scrollIntoView)
			this.page.find('[selected]')[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	/*onBackdropClicked(){
		this.destroy();
	}*/

	/** ***Private*** Item click handler*/
	_onItemClicked(item, index){
		if (item.disabled){
			return;
		}
		
		if (this._multiple == true){
			//if callback returns false, cancel any action
			if (this.onItemClicked(item, index)===false){
				return;	
			}
			//if multiple select, toggle clicked items selected status
			this.items[index].selected = item.selected === true ?  false:  true;
			return;
		}else{
			//if callback returns false, cancel any action
			if (this.onItemClicked(item, index)===false){
				return;	
			}
			this.items[index].selected = true;	
		}	
		this.destroy();
	}

	onCancelClicked(){
		this.destroy();
	}

	/**
	 * 
	 */
	_onOkClicked(){
		return this.onOkClicked(Objects.filter(this.items, el => el.selected === true));
	}

	/**
	 * ***Override***
	 * Callback returns the array of selected items
	 * @param {{[x: string]: any,image?:string,icon?:string,title:string}[]}} selectedItems
	 * @return {void|false}
	 */
	onOkClicked(selectedItems){
		
	}
	/**
	 * ***Overwrite***
	 * Callback notifying an item was selected
	 * Return false to cancel any automatic action
	 * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item 
	 * @param {number} index 
	 * @return {void|false}
	 */
	onItemClicked(item, index){
		//throw new Error('Overwrite onItemClicked');
	}

	getIcon(item){
		if (item.icon){
			return item.icon;
		}
		if (isObject(this.icons)){
			return (this.isSelectedItem(item) ? this.icons.selected :
						(this.isDisabledItem(item) ? this.icons.disabled:  this.icons.deselected)
				); 
		}
	}

	/**
	 * Callback Returns true if the passed item is to be marker 'selected' in the list
	 * @param {*} item 
	 * @return {boolean}
	 */
	isSelectedItem(item){
		return item.selected;
	}
	/**
	 * Callback Returns true if the passed item is to be marked 'disabled' in the list
	 * @param {*} item 
	 * @return {boolean}
	 */
	isDisabledItem(item){
		return item.disabled;
	}
}
OptionsDialogPage.selector = 'page-OptionsDialogPage';