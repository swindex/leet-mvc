import './OptionsDialogPage.scss';
import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { isObject } from 'util';

export class OptionsDialogPage extends DialogPage{
	constructor(page){
		super(page);

		/** @type {{[x: string]: any,image?:string,icon?:string,title:string}[]} */
		this.items=[];
		this.content = `
			<ul>
				<li [foreach]="index in this.items as item" onclick="this._onItemClicked(item)" [selected] = "this.isSelectedItem(item)" [attribute]="{disabled:this.isDisabledItem(item) ? '' : null}">
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
	}

	onLoaded(){
		if(this.page.find('[selected]').length>0 && this.page.find('[selected]')[0].scrollIntoView)
			this.page.find('[selected]')[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	onBackdropClicked(){
		this.destroy();
	}

	_onItemClicked(item){
		if (item.disabled)
			return;
		if (this.onItemClicked(item)===false)
			return;	
		this.destroy();
	}

	onCancelClicked(){
		this.destroy();
	}
	/**
	 * ***Overwrite***
	 * Callback notifying an item was selected
	 * Return false to prevent dialog from closing
	 * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item 
	 * @return {void|false}
	 */
	onItemClicked(item){
		throw new Error('Overwrite onItemClicked');
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