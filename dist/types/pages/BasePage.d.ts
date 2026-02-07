import { NavController } from '../core/NavController';
import { ChangeWatcher } from '../core/ChangeWatcher';
import { BaseComponent } from '../components/BaseComponent';
export declare class BasePage extends ChangeWatcher {
    [key: string]: any;
    page: HTMLElement | null;
    Nav: NavController;
    style: CSSStyleDeclaration | Record<string, any>;
    components: BaseComponent[] | null;
    binder: any;
    name: string | null;
    isDeleting: boolean | null;
    isCreating: boolean | null;
    isHiding: boolean | null;
    isShowing: boolean | null;
    isVisible: boolean | null;
    isDeleted: boolean | null;
    isHidden: boolean | null;
    isRoot: boolean | null;
    selector: string | null;
    className: string | null;
    visibleParent: boolean | null;
    routingUrl: string | null;
    classNames: string[];
    static visibleParent: boolean | null;
    static selector: string | null;
    static className: string | null;
    constructor();
    /**
       * Force Page update
       */
    update(): void;
    _onVisible(): void;
    /**
       * Command the nav controller to remove this page from the stack
       */
    destroy(): void;
    /**
     * Method called by Nav controller to clean up the resources
     */
    _cleanup(): void;
    /**
       * ***OverrideCallSuper***
       * Initialize binder
       */
    _init(binderEvent: any): void;
    /**
       * ***Override***
       * Called after page is created and inserted into the document but before it is rendered
       * @param {HTMLElement} page
       */
    onInit(page: HTMLElement): void;
    /**
       * ***Override***
       * * Called after the page is created and fully rendered
       */
    onLoaded(): void;
    /**
       * ***Override****
       * Called before page is updated either manually, or by watcher
       */
    onBeforeUpdated(): void;
    /**
       * ***Override****
       * Called after page is updated either manually, or by watcher
       */
    onUpdated(): void;
    /**
       * ***Override****
       * * Called every time the page becomes active but before transitions
       */
    onEnter(): void;
    /**
       * ***Override***
       * Called every time the transitions have ended and the page is fully visible.
       */
    onVisible(): void;
    /**
       * ***Override****
       */
    onLeave(): void;
    /**
       * ***Override***
       * @param {{width:number, height:number}} windowSize
       */
    onResize(windowSize: {
        width: number;
        height: number;
    }): void;
    /**
       * ***OverrideCallSuper***
       * @param {{width:number, height:number}} windowSize
       */
    resize(windowSize: {
        width: number;
        height: number;
    }): void;
    /**
       * ***Override***
       * Called when NavController removes it self from the page and page is about to be deleted
       * @override
       */
    onDestroy(): void;
    /**
       * ***Override***
       * Called before page is deleted. Return false to prefent page deletion.
       * @return {any|false}
       * @override
       */
    onBeforeDestroy(): any;
    /**
       * ***Override***
       * Called just before navigating back from the page.
       * return false to cancel the back page navigation
       * @returns {boolean}
       */
    onBackNavigate(): boolean;
    /**
       * Extend the base template with child template.
       * Use <!--child-template--> to mark the slot
       * @param {string} super_template
       * @param {string} child_template
       */
    extendTemplate(super_template: string, child_template: string): string;
    getClassName(): string;
    /**
       * ***Readonly*** property that returns the template string
       *   You can extend base template by returning this.extendTemplate(super.template,'child template string');
       */
    get template(): string;
}
