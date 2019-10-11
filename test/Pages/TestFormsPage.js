import { BasePage } from "../../pages/BasePage";
import { Forms } from "../../components/Forms";
import { Objects } from "../../core/Objects";
import { isObject } from "util";

export class TestFormsPage extends BasePage {
	constructor(){
		super();
		this.form1data = {}
		this.form1errors ={}
		this.form1attributes = {};

		this.form1template = [
			{type:"checkbox", name:"checkbox1",title:"Show text1"},
			{type:"text", name:"text1",title:"text1", validateRule:"required", displayRule:"true_if:checkbox1,true"},
			
			{type:"checkbox", name:"checkbox2",title:"Show form1"},
			{type:"form", name:"form1",title:"form1", displayRule:"true_if:checkbox2,true",items:[
				{type:"text", name:"text2",title:"text2", validateRule:"required"},
			]},
			{type:"form", name:null, title:"form2", items:[
				{type:"text", name:"text3",title:"text3", validateRule:"required"},
			]},
		];

		this.form1 = new Forms(this.form1template, this.form1data, this.form1errors,  this.form1attributes,{nestedData:true});
		this.visibleForm1data = null

		console.log(BasePage instanceof Object);
		console.log((new BasePage()) instanceof Object);

		console.log(typeof BasePage);
		console.log(typeof (new BasePage())) ;

		console.log(typeof (BasePage.prototype));
		console.log(typeof ((new BasePage().prototype))) ;
		
	}
	validate(){
		this.isValid = this.form1.validator.validate();
		this.visibleForm1data = this.form1.getVisibleData();
	}
}

TestFormsPage.template = `
<div [component] = "this.form1"></div>
<button onclick="this.validate()">Validate {{ this.isValid ? 'VALID' : 'INVALID'}}</button>
<hr>
<pre>{{ JSON.stringify(this.form1template,null,'  ') }}</pre>
<hr>
<pre>{{ JSON.stringify(this.form1data,null,'  ') }}</pre>
<hr>
<pre>{{ JSON.stringify(this.form1attributes,null,'  ') }}</pre>
<hr>
<pre>{{ JSON.stringify(this.visibleForm1data,null,'  ') }}</pre>
`;