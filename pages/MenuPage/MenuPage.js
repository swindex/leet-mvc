import './MenuPage.scss';
import { BasePage } from "leet-mvc/pages/BasePage";
import { ItemList } from 'leet-mvc/components/ItemList';
import { isFunction } from 'util';
import { Injector } from 'leet-mvc/core/Injector';


/**
 * @param {HTMLElement} container
 */
export class MenuPage extends BasePage {
	constructor(page) {
		super(page)
		this.down = false;
		//this.selected = selected;

		var st = Injector.Nav ? Injector.Nav.getPages() : null;

		this.currPage = st[st.length-1].page;

		this._items = [];
		this.List = new ItemList()
		//this.items = [];
		this.List.onItemClicked = (item,index)=>{
			this.onItemClicked(item,index)
		};
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
	 * Get/Set Menu Items
	 * @param {{action:Page|string,label:string}[]} items
	 */
	set items (items){
		this.List.items = items;
	}

	/**
	 * @return {{action:Page|string,label:string}[]}
	 */
	get items (){
		return this.List.items;
	}

	/**
	 * Check if the item is selected
	 * @param {{action:any,label:string}} item
	 * @return {boolean}
	 */
	isSelected(item){
		return (isFunction(item.action) && this.currPage instanceof item.action);
	}

	init() {
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
<div class="menu-body">
	<div class="menu-head">
		<div id="logo" [innerHTML] = "this.logo"></div>
	</div>
	<ul class="menu-tree" [directive]="this.List">
		<li $iterator [selected]="this.isSelected(item)">
			<span [innerHTML] = "item.label"></span>
		</li>
	</ul>
</div>
`;
