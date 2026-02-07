import { Watcher, isSkipUpdate, PropertyChangeCallback, ObjectChangeCallback } from './Watcher';

const propChangeHandler = Symbol('propChangeHandler');
const objectChangeHandler = Symbol('objectChangeHandler');

export class ChangeWatcher {
  [isSkipUpdate]: boolean = true;
  [propChangeHandler]: PropertyChangeCallback;
  [objectChangeHandler]: ObjectChangeCallback;

  constructor() {
    this[isSkipUpdate] = true;

    this[propChangeHandler] = (target: any, property: string, value: any) => {
      if (target === this) {
        const change2Method = (this as any)[property + "Change_2"];
        if (typeof change2Method === "function") {
          change2Method(value);
        }
        const changeMethod = (this as any)[property + "Change"];
        if (typeof changeMethod === "function") {
          if (typeof value === "symbol") {
            return;
          }
          changeMethod(value);
        }
      }
    };

    this[objectChangeHandler] = () => {
      this.update();
    };

    const object = Watcher.on(this, this[propChangeHandler], this[objectChangeHandler], ['injectVars']);

    return object as this;
  }

  startWatch(): void {
    this[isSkipUpdate] = false;
  }

  stopWatch(): void {
    Watcher.off(this, this[propChangeHandler]);
    Watcher.off(this, this[objectChangeHandler]);
  }

  /**
   * Called when the binder can finally be updated
   * Children must override this method
   */
  update(): void {
    throw new Error("Must Override");
  }
}