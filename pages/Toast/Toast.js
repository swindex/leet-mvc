import { BasePage } from "./../BasePage";
import { Injector } from "./../../core/Injector";
import { tryCall } from "./../../core/helpers";
import './Toast.scss';

var toastStack = { top: null, bottom: null, middle: null };
/**
 * Show toast popup
 * @param {string} message - text message to display
 * @param {number} [timeout] - timout - default 3000 ms
 * @param {function():any} [onClosed] - callback fied when toast is closed
 * @param {'top'|'bottom'|'middle'} [location] - default bottom
 */
export function Toast(message, timeout, onClosed, location = "bottom") {
  timeout = (timeout === undefined || timeout === null) ? 3000 : timeout;

  //try creating toast stack
  if (!toastStack[location]) {
    var container = document.createElement('div');
    container.className = `toastStack ${location} scroll`;

    toastStack[location] = document.createElement('div');
    toastStack[location].className = `toastStack-container`;

    container.appendChild(toastStack[location]);
    document.body.appendChild(container);
  }

  /** @type {ToastPage} */
  var p = Injector.Nav.pushInto(toastStack[location], ToastPage);
  p.message = message;
  p.className = location;



  p.onClosed = () => {
    tryCall(null, onClosed);
  };

  p.show(timeout);
  return p;
}
export class ToastPage extends BasePage {
  constructor() {
    super();
    this.message = "";
  }
  show(timeout) {
    setTimeout(() => {
      this.destroy();
    }, timeout);
  }
  onDestroy() {
    super.onDestroy();
    this.onClosed();
  }
  /**
	 * ***Override***
	 */
  onClosed() {

  }

  get template() {
    return this.extendTemplate(super.template, `
			<div class="toast-box">
				<span class="message">{{this.message}}</span>
			</div>
		`);
  }

}
ToastPage.visibleParent = true;
ToastPage.selector = "page-ToastPage";