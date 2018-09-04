import { BaseComponent } from "./BaseComponent";

/**
 * Buffered ItemList component
 * to be used as [directive] provider for the Binder engine
 * this.listComp = new ItemList('<span bind = "item"></span>');
 * this.listComp.displayBufferItems = 50;
 * this.listComp.items = ["item 1","item 2","item 3"];
 * this.listComp.onItemClicked = (item, index)=>{
 * 		alert('item was clicked!');	
 * }
 * ...
 * page.template = '<div [directive]="this.listComp">'
 */
export class ItemList extends BaseComponent{
	/**
	 * @param {string} [itemTemplate] - html template text to render into each item by default will output span with bound item
 	 */
	constructor(itemTemplate){
		super();
		itemTemplate = itemTemplate || '<div bind = "item" $iterator></div>';

		//list, that is displayed at the moment
		this._items= [];
		//all items
		this._allItems=[];
		/**
		 * Number of Items to display at once with setList method
		 */
		this.displayBufferItems = 20;
		this._renderedItems = 0;
		this.template = itemTemplate;
		var iterator = ' [foreach]="index in this._items as item" onclick="this.onItemClicked(item, index)"';

		this.html = itemTemplate.replace('$iterator',iterator);

	}
	/**
	 * Set Items array
	 */
	set items(itemsList){
		this.setList(itemsList); 
	}
	/**
	 * Get items array
	 */
	get items(){
		return this._allItems;
	}
	/**
	 * Fires when an item is clicked
	 * @param {*} item
	 */
	onItemClicked(item, index){
		console.log("Override onItemClicked stub!");
		console.log(index, item);
	}

	/**
	 * Event handler fires when scrolled
	 * @param {number} top - current scroll offset
	 * @param {number} max - maximum scroll offset
	 */
	onScroll(top, max){

	};

	/**
	 * Set items for buffered rendering. Recommended for 
	 * @param {any[]} itemsList 
	 */
	setList(itemsList){
		this._allItems = itemsList;
		this._items = this._allItems.slice(0,this.displayBufferItems-1);
		this._renderedItems = this.displayBufferItems-1;
		if (this.binder)
			this.binder.updateElements();
	}

	addItem(item){
		this._allItems.push(item);
		this._items = this._allItems.slice(0,this.displayBufferItems-1);
		this._renderedItems = this.displayBufferItems-1;
		if (this.binder)
			this.binder.updateElements();
	}

	init(container){
		//attach scroll event to the closest parent with touch-scroll class
		$(container).closest('.touch-scroll').on("scroll", (e)=>{
			var el = $(e.target);
			var top = el.scrollTop();
			var max = el[0].scrollHeight - el[0].clientHeight;
			this.onScroll(top, max);
			if (this._allItems && max-top<10 && this._renderedItems < this._allItems.length){
				this._items.push.apply(this._items,this._allItems.slice(this._renderedItems,this._renderedItems+this.displayBufferItems-1))
				this._renderedItems += this.displayBufferItems-1;
				this.binder.updateElements();
			}
		});
	}
}