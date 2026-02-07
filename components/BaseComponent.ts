import { ChangeWatcher } from "../core/ChangeWatcher";
import { Objects } from "../core/Objects";
import { tryCall } from "../core/helpers";

// Binder is still JS, will be properly typed when converted
export interface IBinder {
  updateElements(): void;
  destroy(): void;
}

export class BaseComponent extends ChangeWatcher {
  binder: IBinder | null = null;
  template: string | null = null;
  events: Record<string, (event: Event) => void> | null = null;
  /** fragment with children */
  templateFragment: DocumentFragment | null = null;
  /** update children */
  templateUpdate: () => void = function () { };
  /** reference to the parent page */
  parentPage: any = null;
  container: HTMLElement | null = null;
  attributes: Record<string, any> = {};
  components: BaseComponent[] = [];

  constructor() {
    super();
    Objects.bindMethods(this);
  }

  /**
   * ***DO NOT OVERRIDE***
   * This function is called once after the container is bound to context
   */
  _onInit(container: HTMLElement): void {
    this.container = container;
    super.startWatch();
    // Register my self with the basePage components, so it knows what to destroy later
    if (this.parentPage) {
      if (!this.parentPage.components) {
        this.parentPage.components = [];
      }
      this.parentPage.components.push(this);
    }
    this.onInit(this.container);
    this.returnContext(this);
  }

  /** @override */
  returnContext(context: this): void {
    // Override in subclass
  }

  /**
   * ***Override***
   * This function is called once after the container is bound to context
   */
  onInit(container: HTMLElement): void {
    // Override in subclass
  }

  /**
   * Overrides ChangeWatcher.update method
   */
  update(): void {
    if (this.onBeforeUpdate() === false)
      return;
    if (this.binder)
      this.binder.updateElements();
    this.onUpdate();
  }

  destroy(): void {
    if (this.onDestroy) {
      this.onDestroy();
    }

    if (this.components) {
      for (const i in this.components) {
        const comp = this.components[i];
        if (comp instanceof BaseComponent) {
          tryCall(comp, comp.destroy);
          delete (this.components as any)[i];
        }
      }
    }

    if (this.binder) {
      this.binder.destroy();
    }
    this.stopWatch();
    Objects.strip(this);
  }

  /**
   * ***Override***
   */
  onDestroy(): void {
    // Override in subclass
  }

  /**
   * ***Override***
   * Called before UI is updated
   * Return false to cancel update
   */
  onBeforeUpdate(): void | boolean {
    // Override in subclass
  }

  /**
   * ***Override***
   */
  onUpdate(): void {
    // Override in subclass
  }
}