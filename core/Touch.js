//class that handles swipe and touch events
/**
 * 
 * @param {*} event - the initial touchstart event
 * @param {{swipeDistance:number,tapDuration:number}} [options]
 */
export function Touch(event, options) {
  options = Object.assign(
    {swipeDistance:40,tapDuration:100
    },options);

  var element = event.target;

  var moved = false;
  var xDown = event.touches[0].clientX;
  var yDown = event.touches[0].clientY;
  var xDiff = 0;
  var yDiff = 0;
  var tstart = new Date();
  var tend = new Date();
	
  if (!xDown || !yDown) {
    return null;
  }

  element.addEventListener('touchmove', _onMove); 
  element.addEventListener('touchend', _onEnd); 

  function _onMove(evt) {
    moved = true;
    if (typeof (evt.touches[0]) != 'undefined') {
      var xUp = evt.touches[0].clientX;
      var yUp = evt.touches[0].clientY;
      xDiff = xDown - xUp;
      yDiff = yDown - yUp;
    }
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > options.swipeDistance) {
        self.onSwipe(Touch.LEFT);
        _onEnd(evt);
      } else if (xDiff < -options.swipeDistance){
        self.onSwipe(Touch.RIGHT);
        _onEnd(evt);
      }
    } else {
      if (yDiff > options.swipeDistance) {
        self.onSwipe(Touch.UP);
        _onEnd(evt);
      } else if (yDiff < -options.swipeDistance){
        self.onSwipe(Touch.DOWN);
        _onEnd(evt);
      }
    }
  }
  function _onEnd(evt) {
    element.removeEventListener('touchmove', _onMove); 
    element.removeEventListener('touchend', _onEnd); 

    tend = new Date();

    if (tend.getMilliseconds() - tstart.getMilliseconds() < options.tapDuration && (!moved || (xDiff < options.swipeDistance && yDiff < options.swipeDistance))){
      self.onTap();
    }
  }

  function onSwipe(direction){

  }

  function onTap(){

  }

  var self = {
    onSwipe:onSwipe,
    onTap:onTap,
    start:{x: xDown, y: yDown}
  };
  return self;
}
Touch.LEFT = 1;
Touch.RIGHT = 3;
Touch.UP = 2;
Touch.DOWN = 4;