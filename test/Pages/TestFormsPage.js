import { BasePage } from "../../pages/BasePage";
import { Forms } from "../../components/Forms";
import { Alert } from "../../core/simple_confirm";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { NumericKeyboard } from "../../pages/NumericKeyboard/NumericKeyboard";
import { RegisterComponent } from "../../core/Register";
import { PhoneInputComponent } from '../../components/PhoneInputComponent';

export class TestFormsPage extends HeaderPage {
  constructor() {
    super();
    this.form1data = {};
    this.form1errors = {};
    this.form1attributes = {};

    PhoneInputComponent.Use({ number: true });

    this.testNumber = 0
    this.form1template = [
      { type: "phone", name: "number_phone", title: "Phone Number (numeric kb)", value: "+16474497042", validateRule: "required|regex:/^\\+1\\d{10\\,15}$/,Must be in the following format (234)-456-7891. Maximum 15 digits" },
      { type: "phone", name: "number_phone2", attributes: { number: null }, title: "Phone Number (native kb)", value: "+16474497042", validateRule: "required|regex:/^\\+1\\d{10\\,15}$/,Must be in the following format (234)-456-7891. Maximum 15 digits" },
      { type: "number", name: "number1", title: "Enter Number 1" },
      { type: "number", name: "number2", title: "Enter Number 2", validateRule: "required" },

      { type: "checkbox", name: "checkbox1", title: "Show text1" },
      { type: "text", name: "text1", title: "text1", validateRule: "required", displayRule: "true_if:checkbox1,true", attributes: { onclick: "this.onClicked()" } },

      { type: "checkbox", name: "checkbox2", title: "Show form1", validateRule: "required", },
      {
        type: "form", /*name:"form1"*/ title: "form1", displayRule: "true_if:checkbox2,true", items: [
          { type: "text", name: "text2", title: "text2", validateRule: "required" },
        ]
      },
      {
        type: "form", name: "someForm11", title: "form2", items: [
          { type: "text", name: "text3", title: "someForm11.text3", validateRule: "required" },
        ]
      },
      { type: "number", name: "number3", title: "Enter Number 3" },
    ];

    this.form1 = new Forms(this.form1template, this.form1data, this.form1errors, { nestedData: true });

    this.form1.onClicked = this.onClicked;

    this.visibleForm1data = null;

    console.log(BasePage instanceof Object);
    console.log((new BasePage()) instanceof Object);

    console.log(typeof BasePage);
    console.log(typeof (new BasePage()));

    console.log(typeof (BasePage.prototype));
    console.log(typeof ((new BasePage().prototype)));

    //NumericKeyboard.enable();
    //NumericKeyboard.options.layout = 1;
  }

  onClicked() {
    Alert("CLICKED!");
  }

  validate() {
    this.isValid = this.form1.validator.validate();
    this.visibleForm1data = this.form1.getVisibleData();
    Alert("Validate Clicked!");
  }

  get template() {
    return this.extendTemplate(super.template, template);
  }
}

const template = `
<div class="scroll fill">
  <div>
    <input type="number" bind="this.testNumber"/>
  </div>
  <hr>
	form1data
  <pre>{{ JSON.stringify(this.testNumber,null,'  ') }}</pre>
  
	<div [component] = "this.form1"></div>
	<button onclick="this.validate()">Validate {{ this.isValid ? 'VALID' : 'INVALID'}}</button>
	<!-- <hr>
	form1template
	<pre>{{ JSON.stringify(this.form1template,null,'  ') }}</pre> -->
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