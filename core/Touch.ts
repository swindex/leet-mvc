export type TouchDirection = 1 | 2 | 3 | 4;

export interface TouchOptions {
  swipeDistance?: number;
  tapDuration?: number;
}

export interface TouchInstance {
  onSwipe: (direction: TouchDirection) => void;
  onTap: () => void;
  start: { x: number; y: number };
}

/**
 * Class that handles swipe and touch events
 * @param event - the initial touchstart event
 * @param options
 */
export function Touch(event: TouchEvent, options?: TouchOptions): TouchInstance | null {
  const opts = Object.assign(
    { swipeDistance: 40, tapDuration: 100 },
    options
  );

  const element = event.target as HTMLElement;

  let moved = false;
  const xDown = event.touches[0].clientX;
  const yDown = event.touches[0].clientY;
  let xDiff = 0;
  let yDiff = 0;
  const tstart = new Date();
  let tend = new Date();

  if (!xDown || !yDown) {
    return null;
  }

  element.addEventListener('touchmove', _onMove);
  element.addEventListener('touchend', _onEnd);

  function _onMove(evt: TouchEvent): void {
    moved = true;
    if (typeof evt.touches[0] !== 'undefined') {
      const xUp = evt.touches[0].clientX;
      const yUp = evt.touches[0].clientY;
      xDiff = xDown - xUp;
      yDiff = yDown - yUp;
    }
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > opts.swipeDistance!) {
        self.onSwipe(Touch.LEFT);
        _onEnd(evt);
      } else if (xDiff < -opts.swipeDistance!) {
        self.onSwipe(Touch.RIGHT);
        _onEnd(evt);
      }
    } else {
      if (yDiff > opts.swipeDistance!) {
        self.onSwipe(Touch.UP);
        _onEnd(evt);
      } else if (yDiff < -opts.swipeDistance!) {
        self.onSwipe(Touch.DOWN);
        _onEnd(evt);
      }
    }
  }

  function _onEnd(evt: TouchEvent | Event): void {
    element.removeEventListener('touchmove', _onMove);
    element.removeEventListener('touchend', _onEnd);

    tend = new Date();

    if (tend.getMilliseconds() - tstart.getMilliseconds() < opts.tapDuration! && 
        (!moved || (xDiff < opts.swipeDistance! && yDiff < opts.swipeDistance!))) {
      self.onTap();
    }
  }

  function onSwipe(direction: TouchDirection): void {
    // Override this method
  }

  function onTap(): void {
    // Override this method
  }

  const self: TouchInstance = {
    onSwipe: onSwipe,
    onTap: onTap,
    start: { x: xDown, y: yDown }
  };

  return self;
}

Touch.LEFT = 1 as TouchDirection;
Touch.RIGHT = 3 as TouchDirection;
Touch.UP = 2 as TouchDirection;
Touch.DOWN = 4 as TouchDirection;