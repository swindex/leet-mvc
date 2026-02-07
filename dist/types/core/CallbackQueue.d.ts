interface CallbackWithGUID {
    (...args: any[]): void;
    _CallbackQueueGUID?: string;
}
export declare class CallbackQueue {
    private queue;
    /**
     * Add a callback to queue
     */
    add(callback: CallbackWithGUID): CallbackWithGUID;
    /**
     * Remove callback from Queue
     */
    remove(callback: CallbackWithGUID): void;
    /**
     * Call all callbacks
     */
    call(...args: any[]): void;
}
export {};
