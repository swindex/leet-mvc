import './OptionsDialogPage.scss';
import { DialogPage } from "../DialogPage/DialogPage";
import { Objects } from '../../core/Objects';
import { DOM } from '../../core/DOM';
import { isObject } from '../../core/helpers';

export interface OptionDialogItem{
  title: string;
  text?: string;
  icon?: string;
  image?: string;
  selected?: boolean;
  disabled?: boolean;
}

export interface OptionDialogIcon{
  selected: string;
  deselected: string;
  disabled: string;
}

export class OptionsDialogPage extends DialogPage {
  items: OptionDialogItem[] = [];

  /** Default icons to use when no icons are supplide in items*/
  icons: OptionDialogIcon = {
    selected: 'fas fa-circle',
    deselected: 'far fa-circle',
    disabled: '',
  };
  radioIcons: OptionDialogIcon = {
    selected: 'fas fa-circle',
    deselected: 'far fa-circle',
    disabled: '',
  };
  checkedIcons: OptionDialogIcon = {
    selected: 'far fa-check-square',
    deselected: 'far fa-square',
    disabled: '',
  };

  constructor(title?: string){
    super(title);

    this.content = null;

    this.hideOverflow = false;

    this.buttons = {};

    this.buttons['Cancel']= ()=>{this.onCancelClicked();};
		
    this.multiple = false;
    /** Should dialog close when outside of the window is clicked */
    this.closeOnOutsideClick = true;
  } 

  get template(){
    return super.extendTemplate(super.template, template);
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
  _onItemClicked(item: OptionDialogItem, index: number){
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
    return this.onOkClicked(this.items.filter(el => el.selected === true));
  }

  getSelectedItems(){
    return Objects.filter(this.items, el => el.selected);
  }

  /**
	 * ***Override***
	 * Callback returns the array of selected items
	 * @return {void|false}
	 */
  onOkClicked(selectedItems: OptionDialogItem[]){
		
  }
  /**
	 * ***Overwrite***
	 * Callback notifying an item was selected
	 * Return false to cancel any automatic action
	 * @return {void|false}
	 */
  onItemClicked(item: OptionDialogItem, index: number): boolean | void{
    //throw new Error('Overwrite onItemClicked');
  }

  /**
	 * Callback Returns true if the passed item is to be marker 'selected' in the list
	 * @return {string}
	 */
  getIcon(item: OptionDialogItem){
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
	 */
  getImage(item: OptionDialogItem){
    return item.image;
  }
  /**
	 * Callback Returns true if the passed item is to be marker 'selected' in the list
	 */
  isSelectedItem(item: OptionDialogItem){
    return item.selected;
  }
  /**
	 * Callback Returns true if the passed item is to be marked 'disabled' in the list
	 */
  isDisabledItem(item: OptionDialogItem){
    return item.disabled;
  }
}
OptionsDialogPage.selector = 'page-OptionsDialogPage';

const template = `
  <ul [class]="this.hideOverflow ? 'hideOverflow' : ''">
    <li [foreach]="index in this.items as item" onclick="this._onItemClicked(item, index)" [selected] = "this.isSelectedItem(item)" [attribute]="{disabled:this.isDisabledItem(item) ? '' : null}">
      <i [class] = "this.getIcon(item)" [if]="this.getIcon(item)"></i>
      <img [text]="this.getImage(item)" [if]="this.getImage(item)" />
      <div class="item">
        <div [if] ="item.title"  class="item-title" [text]="item.title"></div>
        <div [if] ="item.text" class="item-text" [text]="item.text"></div>
      </div>
    </li>
  </ul>
`;