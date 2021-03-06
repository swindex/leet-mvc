import { BaseComponent } from "./BaseComponent";
import { DOM } from "../core/DOM";

/**
 * Buffered ItemList component
 * to be used as [directive] provider for the Binder engine
 * this.listComp = new ItemList();
 * this.listComp.displayBufferItems = 50;
 * this.listComp.items = ["item 1","item 2","item 3"];
 * this.listComp.onItemClicked = (item, index)=>{
 * 		alert('item was clicked!');	
 * }
 * ...
 * page.template = '<div [directive]="this.listComp">'
 */
export class ItemList extends BaseComponent {
  constructor() {
    super();
    //list, that is displayed at the moment
    this._renderItems = [];
    //all items
    this._items = [];
		/**
		 * Number of Items to display at once with setList method
		 */
    this.perPage = 20;
    this._displayFrom = 0;
    this._displayTo = 0;
    this.template = `<div></div>`;
  }

	/**
	 * Set Items array
	 */
  set items(itemsList) {
    this.setList(itemsList);
  }
	/**
	 * Get items array
	 */
  get items() {
    return this._items;
  }
	/**
	 * Fires when an item is clicked
	 * @param {*} item
	 */
  onItemClicked(item, index) {
    console.log("Override onItemClicked stub!");
    console.log(index, item);
  }

	/**
	 * Event handler fires when scrolled
	 * @param {number} top - current scroll offset
	 * @param {number} max - maximum scroll offset
	 */
  onScroll(top, max) {

  };

  onBeforeUpdate() {
    //this.templateUpdate();
    //cancel componenet update because parent is going to do that!
    //return false;
  }

	/**
	 * Set items for buffered rendering. Recommended instead of accessing  
	 * @param {any[]} itemsList 
	 */
  setList(itemsList) {
    this._items = itemsList;
    this._displayTo = this.perPage;
    if (this._displayTo > itemsList.length)
      this._displayTo = itemsList.length;
    this._renderItems = this._items.slice(0, this._displayTo);
  }

  addItem(item) {
    this._items.push(item);
    this._renderItems = this._items.slice(0, ++this._displayTo);
  }

	/**
	 * Add items for buffered rendering. Recommended for 
	 * @param {any[]} items 
	 */
  addItems(items) {
    Array.prototype.push.apply(this._items, items);

    this._displayTo += items.length;
    if (this._displayTo > this._items.length)
      this._displayTo = this._items.length;

    this._renderItems = this._items.slice(0, this._displayTo);
  }
  scrollTotop() {
    this.scollParent.scrollTop(0);
  }
  scrollToBottom() {
    setTimeout(() => {
      var vh = this.scollParent.first().offsetHeight;
      var ch = this.container.scrollHeight;
      if (ch > vh) {
        this.scollParent.scrollTop(ch, 'smooth');
      }
    });
  }

  onInit(container) {
    super.onInit(container);
    //attach scroll event to the closest parent with touch-scroll class
    //append parent template contents here
    DOM(container).append(this.templateFragment);
    window.requestAnimationFrame(() => {
      this.scollParent = DOM(DOM(container).closest('.touch-scroll, .scroll').get(0));
      this.scollParent.on("scroll", (e) => {
        var el = DOM(e.target);
        var top = el.scrollTop();
        var max = el.first().scrollHeight - el.first().clientHeight;
        this.onScroll(top, max);
        if (this._items && max - top < 10 && this._displayTo < this._items.length) {
          this._displayTo += this.perPage;
          if (this._displayTo > this._items.length)
            this._displayTo = this._items.length;

          this._renderItems = this._items.slice(0, this._displayTo);
        }
      });
    });
  }
}

ItemList.iterator = function (name) { return ` [foreach]="index in ${name}._renderItems as item" onclick="${name}.onItemClicked(item, index)" `; };