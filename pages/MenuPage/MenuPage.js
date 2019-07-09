import './MenuPage.scss';
import { BasePage } from "./../BasePage"; 
import { isFunction } from 'util';
import { Injector } from './../../core/Injector';


/**
 * @param {HTMLElement} container
 */
export class MenuPage extends BasePage {
	constructor() {
		super()
		this.down = false;
		var st = Injector.Nav ? Injector.Nav.getPages() : null;

		this.currPage = st[st.length-1].page;

		/** @type {{action:Page|string,label:string,className?:string}[]}*/
		this.items = [];

		/**
		 * HTML text to put in logo
		 */
		this.logo="";
	}
	onItemClicked(item,index){
		console.log(item);
		throw new Error("Override onItemClicked");
	}

	onDestroy() {
		super.onDestroy();
		$('body').removeClass('menu-shown');
	};

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
		$('body').addClass('menu-shown');
	};

	onBackdropClicked() {
		this.destroy();
	}
}
MenuPage.visibleParent = true;
MenuPage.selector = "page-menu";
MenuPage.className = "page-Menu";
MenuPage.template = `
<div class="backdrop" onclick="this.onBackdropClicked()"></div>
<div class="menu-body scroll">
	<div class="menu-head">
		<div id="logo" [innerhtml] = "this.logo"></div>
	</div>
	<ul class="menu-tree">
		<li [foreach]="index in this.items as item" onclick="this.onItemClicked(item, index)" [class]="item.className" [selected]="this.isSelected(item)">
			<span [innerhtml] = "item.label"></span>
		</li>
	</ul>
</div>
`;
