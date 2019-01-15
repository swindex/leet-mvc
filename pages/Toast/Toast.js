import { BasePage } from "./../BasePage";
import { Injector } from "./../../core/Injector";
import { tryCall } from "./../../core/helpers";
import './Toast.scss'
/**
 * 
 * @param {string} message - text message to display
 * @param {number} [timeout] - timout - default 3000 ms
 * @param {*} [onClosed] - callback fied when toast is closed
 */
export function Toast(message, timeout, onClosed){
	timeout = (timeout===undefined || timeout===null) ? 3000 : timeout;

	/** @type {ToastPage} */
	var p = Injector.Nav.push(ToastPage);
	p.message = message;
	p.onClosed=()=>{
		tryCall(null, onClosed);
	};
	p.show(timeout);
	
}
export class ToastPage extends BasePage{
	constructor(page){
		super(page);
		this.message = "Toast!";
	}
	show(timeout){
		setTimeout(()=>{
			this.destroy();
		},timeout);
	}
	onDestroy(){
		super.onDestroy();
		this.onClosed();
	}
	/**
	 * ***Override***
	 */
	onClosed(){

	}
	
}
ToastPage.visibleParent = true;
ToastPage.selector = "page-ToastPage";
ToastPage.template = `
<div class = "backdrop">
	<div class="toast-box">
		<span class="message">{{this.message}}</span>
	</div>
</div>
`