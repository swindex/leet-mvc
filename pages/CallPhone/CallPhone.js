import * as template from './CallPhone.html';
import './CallPhone.scss';
import { DialogPage } from "../DialogPage/DialogPage";

export class CallPhone extends DialogPage{
	constructor(page, title, prompt, numberPre ,number, useSMS){
		super(page);
		this.title=title || "Complete action with number";
		
		this.prompt=prompt;
		this.number=number;
		this.numberPre=numberPre;
		this.useSMS=useSMS;

		this.buttons ={"Cancel": this.onCancelClicked};
		this.content = template;

	}
	
	getCallUrl(){
		return "tel:"+this.number;
	}

	getTextUrl(){
		return "sms:"+this.number;
	}

	onCancelClicked(){
		this.destroy();
	}

	onCallClicked(evt){
		try{
			window.plugins.CallNumber.callNumber(function(){}, ()=>{
				window.open(this.getCallUrl(), '_system', '');
				//throw new Error("Unable to make a call!");
			}, this.number, true);
		}catch(ex){
			window.open(this.getCallUrl(), '_system', '');
		}
		this.destroy();
	}

	onTextClicked(){
		window.open(this.getTextUrl(), '_system', '');
		this.destroy();
	}
}
CallPhone.selector = 'page-CallPhone';
CallPhone.visibleParent = true;