// @ts-nocheck
import { BasePage } from "../../pages/BasePage";
import { Forms } from "../../components/Forms";
import { Alert } from "../../core/simple_confirm";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { NumericKeyboard } from "../../pages/NumericKeyboard/NumericKeyboard";

export class TestFormsVisiblePage extends HeaderPage {
	form1data: any;
	form1errors: any;
	form1attributes: any;
	form1template: any[];
	form1: Forms;
	visibleForm1data: any;
	isValid: boolean;

	constructor(){
		super();
		this.form1data = {}
		this.form1errors ={}
		this.form1attributes = {};

		this.form1template = [
			{type:"select", name:"select1", value:"val1", title:"option1", items:[
				{ value: "val1", title: "Value 1" },
				{ value: "val2", title: "Value 2" },
			]},
			{type:"select", name:"select2", value:"val11", title:"select2", displayRule:"true_if:select1,val2", items:[
				{ value: "val11", title: "Value 1" },
				{ value: "val22", title: "Value 2" },

			] },
			
			{type:"text", name:"text1",title:"text1", validateRule:"required", displayRule:"true_if:select2,val22" },
		];

		this.form1 = new Forms(this.form1template, this.form1data, this.form1errors, {nestedData:true});

		this.form1.onClicked = this.onClicked;

		this.visibleForm1data = null

		console.log(BasePage instanceof Object);
		console.log((new BasePage()) instanceof Object);

		console.log(typeof BasePage);
		console.log(typeof (new BasePage())) ;

		console.log(typeof (BasePage.prototype));
		console.log(typeof ((new BasePage().prototype))) ;
		
		NumericKeyboard.enable();
		NumericKeyboard.options.layout = 1;
	}

	onClicked(){
		Alert("CLICKED!");
	}

	validate(){
		this.isValid = this.form1.validator.validate();
		this.visibleForm1data = this.form1.getVisibleData();
	}

	get template(){
		return this.extendTemplate(super.template, template)
	}
}

const template = `
<div class="scroll fill">
	<div [component] = "this.form1"></div>
	<button onclick="this.validate()">Validate {{ this.isValid ? 'VALID' : 'INVALID'}}</button>
	<hr>
	form1template
	<pre>{{ JSON.stringify(this.form1template,null,'  ') }}</pre>
	<hr>
	form1data
	<pre>{{ JSON.stringify(this.form1data,null,'  ') }}</pre>
	<hr>
	visibleForm1data 
	<pre>{{ JSON.stringify(this.visibleForm1data,null,'  ') }}</pre>
	<hr>
	form1errors
	<pre>{{ JSON.stringify(this.form1errors,null,'  ') }}</pre>
	<hr>
	form.fields
	<pre>{{ JSON.stringify(this.form1.fields,null,'  ') }}</pre>
</div>
`;