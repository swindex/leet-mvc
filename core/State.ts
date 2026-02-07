import { tryCall } from "./helpers";
import { Objects } from "./Objects";

export interface StateListener {
  index: number;
  remove: () => void;
}

export interface StateInstance<T> {
  readonly isRunning: boolean;
  get: () => T;
  data: T;
  onChange: (dataChanged?: (data: T) => void, statusChanged?: (isRunning: boolean) => void) => StateListener;
  onSet: (dataChanged?: (data: T) => void, statusChanged?: (isRunning: boolean) => void) => StateListener;
  remove: (listener: StateListener) => boolean;
  set: (data: T | undefined) => void;
}

interface QueueItem<T> {
  dataChanged?: (data: T) => void;
  statusChanged?: (isRunning: boolean) => void;
}

/**
 * This factory function allows to create shared state across multiple modules with listeners, getters and emitters
 */
export function State<T>(data: T): StateInstance<T> {
  const Queue: { [key: number]: QueueItem<T> } = {};
  let Data = Objects.copy(data);
  let index = 0;
  let isRunning: boolean = false;
  let isSet: boolean = false;

  /**
   * Add a callback to queue
   */
  function onChange(
    dataChanged?: (data: T) => void,
    statusChanged?: (isRunning: boolean) => void
  ): StateListener {
    index++;
    Queue[index] = { dataChanged, statusChanged };

    const i = index;
    const listener: StateListener = {
      index: i,
      remove: function () {
        removeIndex(i);
        delete (this as any).index;
        delete (this as any).remove;
      }
    };
    listener.remove = listener.remove.bind(listener);
    return listener;
  }

  /**
   * Add a callback to queue AND call the callback if already set!
   */
  function onSet(
    dataChanged?: (data: T) => void,
    statusChanged?: (isRunning: boolean) => void
  ): StateListener {
    if (isSet) {
      tryCall(null, dataChanged, Objects.copy(Data));
    }
    tryCall(null, statusChanged, isRunning);

    return onChange(dataChanged, statusChanged);
  }

  /**
   * Remove callback from Queue
   */
  function remove(listener: StateListener): boolean {
    if (listener && listener.index) {
      removeIndex(listener.index);
      delete (listener as any).index;
      delete (listener as any).remove;

      return true;
    }
    console.log('CallbackQueue: unable to .remove callback:', index);
    return false;
  }

  /**
   * Remove callback from Queue by index
   */
  function removeIndex(idx: number): boolean {
    if (Queue[idx]) {
      delete Queue[idx];
      return true;
    }
    console.log('CallbackQueue: unable to .remove callback:', idx);
    return false;
  }

  /**
   * Call all callbacks
   */
  function set(newData: T | undefined): void {
    isSet = newData === undefined ? false : true;
    Data = Objects.copy(newData as T);
    // Execute callbacks in Queue
    for (const i in Queue) {
      const callback = Queue[i].dataChanged;
      if (callback) {
        try {
          tryCall(null, callback, Objects.copy(newData as T));
        } catch (ex) {
          console.warn(ex);
        }
      }
    }
    setRunning(false);
  }

  /**
   * Set running status
   */
  function setRunning(newStatus: boolean): void {
    if (isRunning === newStatus) {
      return;
    }
    isRunning = newStatus;
    for (const i in Queue) {
      const callback = Queue[i].statusChanged;
      if (callback) {
        tryCall(null, callback, isRunning);
      }
    }
  }

  const Me: StateInstance<T> = {
    get isRunning() { return isRunning; },
    set isRunning(val: boolean) { setRunning(val); },
    get: function () { return Data; },
    get data() {
      return Data;
    },
    set data(newData: T) {
      set(newData);
    },
    onChange: onChange,
    remove: remove,
    set: set,
    onSet: onSet,
  };

  return Me;
}