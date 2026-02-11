import { Binder } from '../core/Binder';
import { NavController } from '../core/NavController';
import { ChangeWatcher } from '../core/ChangeWatcher';
import { tryCall } from '../core/helpers';
import { BaseComponent } from '../components/BaseComponent';
import { Objects } from '../core/Objects';

export class BasePage extends ChangeWatcher{
  [key: string]: any;
  page: HTMLElement | null = null;
  Nav!: NavController;
  style: CSSStyleDeclaration | Record<string, any> = {};
  components: BaseComponent[] | null = null;
  binder: any = null;
  name: string | null = null;
  isDeleting: boolean | null = null;
  isCreating: boolean | null = null;
  isHiding: boolean | null = null;
  isShowing: boolean | null = null;
  isVisible: boolean | null = null;
  isDeleted: boolean | null = null;
  isHidden: boolean | null = null;
  isRoot: boolean | null = null;
  selector: string | null = null;
  className: string | null = null;
  visibleParent: boolean | null = null;
  routingUrl: string | null = null;
  classNames: string[] = [];

  static visibleParent: boolean | null = null;
  static selector: string | null = null;
  static className: string | null = null;

  constructor(){
    super();
    this.page = null;
    // @ts-ignore
    this.style = {};
    this.components = null;
    this.binder = new Binder(this);

    this.name = null;

    this.isDeleting = null;
    this.isCreating = null;
    this.isHiding = null;
    this.isShowing = null;
    this.isVisible = null;
    this.isDeleted = null;
    this.isHidden = null;
    this.isRoot = null;

    this.selector = (this.constructor as any).selector;
    this.className = (this.constructor as any).className;
    this.visibleParent = (this.constructor as any).visibleParent;

    this.routingUrl = null; //for router

    this.classNames = [];

    //Be lazy. This allows us to directly pass page methods without having to worry about "this"
    Objects.bindMethods(this);
  }

	

  /**
	 * Force Page update
	 */
  update(){
    if (!this.binder)
      return;

    this.onBeforeUpdated();	
    this.binder.updateElements();
    this.onUpdated();
  }

  _onVisible(){
    this.onVisible();
  }

  /**
	 * Command the nav controller to remove this page from the stack
	 */
  destroy(){
    if (this.isDeleted || this.isDeleting) {
      return;
    }
		
    //if nav exists, then tell nav to delete the page. Nav will then call this method again
    if (this.Nav){
      //tell Nav to remove the page from the stack
      this.Nav.remove(this);
    } 
  }

  /**
   * Method called by Nav controller to clean up the resources
   */
  _cleanup() {
      //notify whoever implements, that page is to be destroyed.
      this.onDestroy();		
					
      //Call destroy on all child components
      if (this.components){
        for (let i in this.components){
          var comp = (this.components as any)[i];
          if (comp instanceof BaseComponent){
            tryCall(comp, comp.destroy);
            delete (this.components as any)[i];
          }
        }
      }
      //destroy binder
      if (this.binder){
        this.binder.destroy();
      }
      //Destroy the rest of listeners, properties and methods
      this.stopWatch();
      Objects.strip(this);
      this.isDeleted = true;
  }

  //Implementation of Lifecycle callbacks that are called by NavController
  /**
	 * ***OverrideCallSuper***
	 * Initialize binder
	 */
  _init(binderEvent: any){
 		//this.template = BasePage.template.replace('<!--child-template-->', this.template);

    this.binder!.bindElements(binderEvent, this.template);
    this.page = this.binder!.vdom.elem as HTMLElement;
    super.startWatch();
  }

  /**
	 * ***Override***
	 * Called after page is created and inserted into the document but before it is rendered
	 * @param {HTMLElement} page 
	 */
  onInit(page: HTMLElement){
		
  }
  /**
	 * ***Override***
	 * * Called after the page is created and fully rendered
	 */
  onLoaded(){

  }
  /**
	 * ***Override****
	 * Called before page is updated either manually, or by watcher
	 */
  onBeforeUpdated(){
    //console.log(this.constructor.name, 'updated');
  }
  /**
	 * ***Override****
	 * Called after page is updated either manually, or by watcher
	 */
  onUpdated(){
    //console.log(this.constructor.name, 'updated');
  }

  /**
	 * ***Override****
	 * * Called every time the page becomes active but before transitions
	 */
  onEnter(){

  }

  /**
	 * ***Override***
	 * Called every time the transitions have ended and the page is fully visible.
	 */
  onVisible(){

  }
  /**
	 * ***Override****
	 */
  onLeave(){

  }
  /**
	 * ***Override***
	 * @param {{width:number, height:number}} windowSize
	 */
  onResize(windowSize: {width: number, height: number}){

  }
  /**
	 * ***OverrideCallSuper***
	 * @param {{width:number, height:number}} windowSize
	 */
  resize(windowSize: {width: number, height: number}){
    this.onResize(windowSize);
  }

  /**
	 * ***Override***
	 * Called when NavController removes it self from the page and page is about to be deleted
	 * @override
	 */
  onDestroy(){
  }

  /**
	 * ***Override***
	 * Called before page is deleted. Return false to prefent page deletion. 
	 * @return {any|false}
	 * @override
	 */
  onBeforeDestroy(): any {
    return true;
  }
	
  /**
	 * ***Override***
	 * Called just before navigating back from the page.
	 * return false to cancel the back page navigation
	 * @returns {boolean}
	 */
  onBackNavigate(){
    return true;
  }

  /**
	 * Extend the base template with child template.
	 * Use <!--child-template--> to mark the slot
	 * @param {string} super_template 
	 * @param {string} child_template 
	 */
  extendTemplate(super_template: string, child_template: string){
    return super_template.replace('<!--child-template-->', child_template );
  }

  getClassName(){
    return [this.className, ...this.classNames ].join(' ');
  }

  /**
	 * ***Readonly*** property that returns the template string
	 *   You can extend base template by returning this.extendTemplate(super.template,'child template string');
	 */
  get template(): string {
    return `<div page [class]="this.getClassName()" [style]="this.style" [attribute]="{root: this.isRoot, hidden:this.isHidden,visible:this.isVisible,showing:this.isShowing,hiding:this.isHiding,creating:this.isCreating,deleting:this.isDeleting}"><!--child-template--></div>`;
  }
}
BasePage.visibleParent = null;
BasePage.selector = null;
BasePage.className = null;