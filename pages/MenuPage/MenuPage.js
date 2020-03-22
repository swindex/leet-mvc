import './MenuPage.scss';
import { BasePage } from "./../BasePage"; 
import { isFunction } from 'util';
import { Injector } from './../../core/Injector';
import { DOM } from '../../core/DOM';


/**
 * @param {HTMLElement} container
 */
export class MenuPage extends BasePage {
  constructor(position) {
    super();
    this.down = false;
    this.position = position || "left";
    if (this.position) {
      this.className = this.className + " " + this.position;
    }
    var st = Injector.Nav ? Injector.Nav.getPages() : null;

    this.currPage = st[st.length-1].page;

    /** @type {{action:Page|string,label:string,className?:string}[]}*/
    this.items = [];

    /**
		 * HTML text to put in logo
		 */
    this.logo="";

    this.slogan = "";
  }
  _onItemClicked(item,index){
    this.destroy();
    this.onItemClicked(item,index);	
  }

  onItemClicked(item,index){
    console.log(item);
    throw new Error("Override onItemClicked");
  }

  onDestroy() {
    super.onDestroy();
    DOM('body').first().classList.remove('menu-shown');
  }

  /**
	 * Check if the item is selected
	 * @param {{action:any,label:string}} item
	 * @return {boolean}
	 */
  isSelected(item){
    return (isFunction(item.action) && this.currPage instanceof item.action);
  }

  onVisible(){
    console.log("");
  }

  onInit() {
    DOM('body').first().classList.add('menu-shown');
  }

  onBackdropClicked() {
    this.destroy();
  }

  get template (){
    return this.extendTemplate(super.template, template);
  }
}
MenuPage.visibleParent = true;
MenuPage.selector = "page-menu";
MenuPage.className = "page-Menu";
var template = `
<div class="backdrop" onclick="this.onBackdropClicked()"></div>
<div class="menu-body scroll">
	<div class="menu-head">
		<div id="logo" [innerhtml] = "this.logo"></div>
		<div id="slogan" [innerhtml] = "this.slogan"></div> 
	</div>
	<ul class="menu-tree">
		<li [foreach]="index in this.items as item" onclick="this._onItemClicked(item, index)" [class]="item.className" [selected]="this.isSelected(item)">
			<span [innerhtml] = "item.label"></span>
		</li>
	</ul>
</div>
`;
