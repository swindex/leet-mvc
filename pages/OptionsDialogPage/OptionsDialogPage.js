import './OptionsDialogPage.scss';
import { DialogPage } from "../DialogPage/DialogPage";
import { Objects } from '../../core/Objects';
import { DOM } from '../../core/DOM';
import { isObject } from 'leet-mvc/core/helpers';

export class OptionsDialogPage extends DialogPage{
  constructor(){
    super();

    /**
		 * List items 
		 * @type {{[x: string]: any,image?:string,icon?:string,title:string,text?:string, selected?:boolean}[]} */
    this.items=[];
    this.content = `
			<ul [class]="this.hideOverflow ? 'hideOverflow' : ''">
				<li [foreach]="index in this.items as item" onclick="this._onItemClicked(item, index)" [selected] = "this.isSelectedItem(item)" [attribute]="{disabled:this.isDisabledItem(item) ? '' : null}">
					<i [class] = "this.getIcon(item)" [if]="this.getIcon(item)"></i>
					<img bind = "this.getImage(item)" [if]="this.getImage(item)" />
					<div class="item">
						<div [if] ="item.title"  class="item-title" bind = "item.title"></div>
						<div [if] ="item.text" class="item-text" bind = "item.text"></div>
					</div>
				</li>
			</ul>
		`;

    this.hideOverflow = false;

    this.buttons = {};

    this.buttons['Cancel']= ()=>{this.onCancelClicked();};
		
    /** Default icons to use when no icons are supplide in items*/
    this.icons = {
      selected: 'fas fa-circle',
      deselected: 'far fa-circle',
      disabled: '',
    };
		
    this.radioIcons = {
      selected: 'fas fa-circle',
      deselected: 'far fa-circle',
      disabled: '',
    };

    this.checkedIcons = {
      selected: 'far fa-check-square',
      deselected: 'far fa-square',
      disabled: '',
    };
    this.multiple = false;
    /** Should dialog close when outside of the window is clicked */
    this.closeOnOutsideClick = true;
  } 

  /**
	 * Set to true to seelct multiple items
	 * @param {boolean} value
	 */ 
  set multiple (value){
    this._multiple = value;
    if (value==true){
      this.buttons['Ok'] = ()=>{this._onOkClicked();};
      this.icons = this.checkedIcons;
    }else{
      if (this.buttons['Ok']){
        delete this.buttons['Ok'];
      }
      this.icons = this.radioIcons;
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
    setTimeout(()=>{
      var selected = DOM(this.page).find('[selected]')[0];
      if(selected && selected.scrollIntoView){
        selected.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    },100);
  }

  onBackdropClicked(){
    if (this.closeOnOutsideClick){
      this.destroy();
    }
  }

  /** ***Private*** Item click handler*/
  _onItemClicked(item, index){
    if (item.disabled || this.isDeleting){
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
    //will be destoyed by DialogPage handler
    return true;
  }

  /**
	 * ***Private***
	 */
  _onOkClicked(){
    return this.onOkClicked(Objects.filter(this.items, el => el.selected === true));
  }

  getSelectedItems(){
    return Objects.filter(this.items, el => el.selected);
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

  /**
	 * Callback Returns true if the passed item is to be marker 'selected' in the list
	 * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item 
	 * @return {string}
	 */
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
	 * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item 
	 * @return {string}
	 */
  getImage(item){
    return item.image;
  }
  /**
	 * Callback Returns true if the passed item is to be marker 'selected' in the list
	 * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item 
	 * @return {boolean}
	 */
  isSelectedItem(item){
    return item.selected;
  }
  /**
	 * Callback Returns true if the passed item is to be marked 'disabled' in the list
	 * @param {{[x: string]: any,image?:string,icon?:string,title:string}} item 
	 * @return {boolean}
	 */
  isDisabledItem(item){
    return item.disabled;
  }
}
OptionsDialogPage.selector = 'page-OptionsDialogPage';