import { GUID } from "./helpers";
import { Objects } from "./Objects";

interface CallbackWithGUID {
  (...args: any[]): void;
  _CallbackQueueGUID?: string;
}

export class CallbackQueue {
  private queue: { [uid: string]: CallbackWithGUID } = {};

  /**
   * Add a callback to queue
   */
  add(callback: CallbackWithGUID): CallbackWithGUID {
    // Modify callback by adding index to it
    callback._CallbackQueueGUID = GUID();
    this.queue[callback._CallbackQueueGUID] = callback;
    return callback;
  }

  /**
   * Remove callback from Queue
   */
  remove(callback: CallbackWithGUID): void {
    // Use index to remove the callback we created
    const UID = callback._CallbackQueueGUID;
    if (UID && this.queue[UID])
      delete this.queue[UID];
    else {
      console.log('CallbackQueue: unable to .remove callback:', callback);
    }
  }

  /**
   * Call all callbacks
   */
  call(...args: any[]): void {
    const queue = this.queue;
    // Execute callbacks in non-blocking fashion
    setTimeout(() => {
      Objects.forEach(queue, (obj: CallbackWithGUID) => {
        obj(...args);
      });
    }, 0);
  }
}