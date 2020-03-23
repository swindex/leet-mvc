import './ActionSheetPage.scss';
import { BasePage } from './../BasePage';

/**
 * @param {HTMLElement} container
 */
export class ActionSheetPage extends BasePage {

  constructor(){
    super();
    /** @type {{image:string,icon:string,title:string}[]} */
    this.items = null;
  }
  /**
	 * @param {*} d 
	 */
  slideDirection(d){
    this.page.classList.remove('direction-0');
    this.page.classList.remove('direction-1');
    this.page.classList.remove('direction-2');
    this.page.classList.remove('direction-3');
		
    this.page.classList.add('direction-'+d);
  }

  onBackdropClicked(){
    this.destroy();
  }

  _onItemClicked(item){
    this.destroy();
  }

  onItemClicked(item){
    throw new Error('Overwrite onItemClicked');
  }

  /**
	 * Callback Returns true if the passed item is to be marker 'selected' in the list
	 * @param {*} item 
	 * @return {boolean}
	 */
  isSelectedItem(item){
    return false;
  }

  get template() {
    return this.extendTemplate(super.template,`
			<div class="backdrop" onclick="this.onBackdropClicked()"></div>
			<div class="menu-body" onclick="this.onBackdropClicked()">
				<ul class="menu-tree">
					<li [foreach]="index in this.items as item" onclick="this.onItemClicked(item); this._onItemClicked(item)" [selected] = "this.isSelectedItem(item)">
						<i [class] = "item.icon" [if]="item.icon"></i>
						<img bind = "item.image" [if]="item.image" />
						<span [innerhtml] = "item.title"></span>
					</li>
				</ul>
			</div>
		`);
  }
}
ActionSheetPage.Direction={
  Left: 0,
  Top: 1,
  Right: 2,
  Up: 3,
};
ActionSheetPage.visibleParent = true;
ActionSheetPage.className = "page-ActionSheetPage";

