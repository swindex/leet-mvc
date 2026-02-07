export type TouchDirection = 1 | 2 | 3 | 4;
export interface TouchOptions {
    swipeDistance?: number;
    tapDuration?: number;
}
export interface TouchInstance {
    onSwipe: (direction: TouchDirection) => void;
    onTap: () => void;
    start: {
        x: number;
        y: number;
    };
}
/**
 * Class that handles swipe and touch events
 * @param event - the initial touchstart event
 * @param options
 */
export declare function Touch(event: TouchEvent, options?: TouchOptions): TouchInstance | null;
export declare namespace Touch {
    var LEFT: TouchDirection;
    var RIGHT: TouchDirection;
    var UP: TouchDirection;
    var DOWN: TouchDirection;
}
