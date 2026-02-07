import { tryCall } from "./helpers";
import { Objects } from "./Objects";

export interface State2Listener<T, E = any> {
  index: number;
  destroy: () => void;
  remove: () => void;
  onSet: (callback: (data: T) => void) => State2Listener<T, E>;
  onError: (callback: (error: E) => void) => State2Listener<T, E>;
  onStatus: (callback: (isRunning: boolean) => void) => State2Listener<T, E>;
}

export interface State2Instance<T, E = any> {
  newListener: () => State2Listener<T, E>;
  error: E;
  isRunning: boolean;
  data: T;
  destroy: () => void;
  remove: (listener: State2Listener<T, E>) => boolean;
  setData: (data: T | undefined) => void;
  setError: (error: E) => void;
  setRunning: (newStatus: boolean) => void;
}

interface QueueItem<T, E> {
  _onSet?: (data: T) => void;
  _onError?: (error: E) => void;
  _onStatus?: (isRunning: boolean) => void;
}

/**
 * This factory function allows to create shared state across multiple modules with listeners, getters and emitters
 */
export function State2<T, E = any>(data: T): State2Instance<T, E> {
  const Queue: { [key: number]: QueueItem<T, E> } = {};
  let Data = Objects.copy(data);
  let _error: E;
  let index = 0;
  let isRunning: boolean = false;
  let isSet: boolean = false;

  /**
   * Add a callback to queue
   */
  function add(): State2Listener<T, E> {
    index++;
    Queue[index] = {};

    const i = index;
    const listener: State2Listener<T, E> = {
      index: i,
      destroy: function () {
        removeIndex(i);
        delete (this as any).index;
        delete (this as any).remove;
      },
      remove: function () {
        removeIndex(i);
        delete (this as any).index;
        delete (this as any).remove;
      },
      onSet: function (callback: (data: T) => void) {
        Queue[this.index]._onSet = callback;
        if (isSet) {
          tryCall(null, callback, Objects.copy(Data));
        }
        return listener;
      },
      onError: function (callback: (error: E) => void) {
        Queue[this.index]._onError = callback;
        if (_error) {
          tryCall(null, callback, Objects.copy(_error));
        }
        return this;
      },
      onStatus: function (callback: (isRunning: boolean) => void) {
        Queue[this.index]._onStatus = callback;
        tryCall(null, callback, isRunning);
        return this;
      },
    };
    listener.remove = listener.remove.bind(listener);
    listener.onSet = listener.onSet.bind(listener);
    listener.onError = listener.onError.bind(listener);
    listener.onStatus = listener.onStatus.bind(listener);
    return listener;
  }

  /**
   * Remove all callbacks
   */
  function destroy(): void {
    for (const i in Queue) {
      removeIndex(parseInt(i));
    }
  }

  /**
   * Remove callback from Queue
   */
  function remove(listener: State2Listener<T, E>): boolean {
    if (listener && listener.index) {
      removeIndex(listener.index);
      delete (listener as any).index;
      delete (listener as any).remove;
      delete (listener as any).onSet;
      delete (listener as any).onError;
      delete (listener as any).onStatus;
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
  function setData(newData: T | undefined): void {
    isSet = newData === undefined ? false : true;
    Data = Objects.copy(newData as T);
    // Execute callbacks in Queue
    for (const i in Queue) {
      const callback = Queue[i]._onSet;
      if (callback) {
        try {
          tryCall(null, callback, Objects.copy(Data));
        } catch (ex) {
          console.warn(ex);
        }
      }
    }
    setStatus(false);
  }

  /**
   * Set error and call all error callbacks
   */
  function setError(errorData: E): void {
    _error = Objects.copy(errorData);
    // Execute callbacks in Queue
    for (const i in Queue) {
      const callback = Queue[i]._onError;
      if (callback) {
        try {
          tryCall(null, callback, Objects.copy(errorData));
        } catch (ex) {
          console.warn(ex);
        }
      }
    }
    setStatus(false);
  }

  /**
   * Set running status
   */
  function setStatus(newStatus: boolean): void {
    if (isRunning === newStatus) {
      return;
    }
    isRunning = newStatus;
    for (const i in Queue) {
      const callback = Queue[i]._onStatus;
      if (callback) {
        tryCall(null, callback, isRunning);
      }
    }
  }

  const Me: State2Instance<T, E> = {
    newListener: add,
    get error() {
      return _error;
    },
    set error(val: E) {
      setError(val);
    },
    get isRunning() {
      return isRunning;
    },
    set isRunning(val: boolean) {
      setStatus(val);
    },
    get data() {
      return Data;
    },
    set data(newData: T) {
      setData(newData);
    },
    destroy: destroy,
    remove: remove,
    setData: setData,
    setError: setError,
    setRunning: setStatus
  };

  return Me;
}