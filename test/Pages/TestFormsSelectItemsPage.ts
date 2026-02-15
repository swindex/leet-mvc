// @ts-nocheck
import { BasePage } from "../../pages/BasePage";
import { Forms } from "../../components/Forms";
import { Alert } from "../../core/simple_confirm";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { NumericKeyboard } from "../../pages/NumericKeyboard/NumericKeyboard";

export class TestFormsSelectItemsPage extends HeaderPage {
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

		var form1template = [{"validateRule":"required","name":"commentMethod","placeholder":"-- Please Select --","title":"Comments","type":"select","items":[{"title":"Appraiser requires this appraisal to be cancelled/re-assigned","value":"cancelledReassignedAppraiser","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Appraiser requires supporting documentation in order to complete such as floor plans, blueprints, etc.","value":"requireAgreementSupportingDoc","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Appraiser assigned to this request","value":"assignedAppraiser","items":[{"validateRule":"required","name":"appraiserUsername","placeholder":"Select Appraiser","title":"Appraiser Name","type":"select","items":[{"title":"Appraiser not found","value":"","items":[{"name":"note1","title":"Note","type":"label","value":"Enter the appraiser information below. And contact NAS at appraisers@nationwideappraisals.com to set up an account."},{"validateRule":"","name":"appraiserDesignation","title":"Designation","type":"select","items":[{"title":"Candidate","value":"Candidate"},{"title":"CRA","value":"CRA"},{"title":"DAR","value":"DAR"},{"title":"E.A.","value":"E.A."},{"title":"DAC","value":"DAC"},{"title":"AACI","value":"AACI"},{"title":"MVA","value":"MVA"}]},{"validateRule":"required|max:50","name":"appraiserFirstname","title":"First Name","type":"text"},{"validateRule":"required|max:50","name":"appraiserLastname","title":"Last Name","type":"text"},{"validateRule":"required|max:20","name":"appraiserPhone","title":"Phone Number","type":"phone"},{"validateRule":"required|max:20","name":"appraiserMobilePhone","title":"Mobile Number","type":"phone"},{"validateRule":"required|max:100","name":"appraiserEmail","title":"Email Address","type":"email"}]},{"title":"John Flynn","value":"John Flynn"},{"title":"joseph-assoc","value":"joseph-assoc"},{"title":"tmdar","value":"tmdar"}]}]},{"title":"Request is a tenanted property, appraiser will update NAS site with appointment as soon as tenant confirms","value":"tenantedProperty","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Appraiser requires purchase/sale agreement in order to complete.","value":"requireAgreement","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Fee increase status update","value":"feeIncreaseStatusUpdate","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Appraiser requires additional contact information and/or confirmation of address information","value":"requireVerification","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Require technical support/assistance","value":"technicalSupport","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"File assigned as a Desktop, however a Desktop is not possible for this appraisal","value":"fileAssignedAsDesktop","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Applicant delay","value":"applicantNotReadyToProceed","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Policy/requirements verification","value":"policyRequirementsVerification","items":[{"validateRule":"required","name":"check1","title":"I have reviewed the lender requirements attached to this request","type":"checkbox"},{"validateRule":"required","name":"comment","title":"Message","type":"textarea","value":"Policy/requirements verification"}]},{"title":"Estimated Time of Report Delivery","value":"appraisalReportWillBeUploadedShortly","items":[{"validateRule":"required","name":"report_date_from","title":"Report Completion Date","type":"dateTime"},{"validateRule":"required","name":"report_date_to","title":"Report Completion Time","type":"time"},{"validateRule":"required","name":"comment","title":"Message","type":"text"}]},{"title":"Left message for the contact(s) ","value":"messageLeft","items":[{"validateRule":"required","name":"comment","title":"Message","type":"text"}]}]}]

		this.form1 = new Forms(form1template, this.form1data, this.form1errors, {nestedData:true});
    	this.form1template = form1template;
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
  <hr>
	form1template
	<pre>{{ JSON.stringify(this.form1template,null,'  ') }}</pre>
</div>
`;