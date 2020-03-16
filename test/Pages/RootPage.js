import { TestArrayPage } from "./TestArrayPage";
import { TestFormsPage } from "./TestFormsPage";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { TestFileUploadPage } from "./TestFileUploadPage";

export class RootPage extends HeaderPage{
	constructor(){
		super()

		this.pages = [
			{page: TestArrayPage, name: "Test Array Page"},
			{page: TestFormsPage, name: "Test Forms Page"},
			{page: TestFileUploadPage, name: "Test File upload"},
			
		]

	}

	loadPage(index){

		var p = this.Nav.push(this.pages[index].page);
		p.backButton = true;
	}

	get template(){
		return super.extendTemplate(super.template, template);
	}
}

var template = `
<div [foreach]="index in this.pages as item">
	<button onclick="this.loadPage(index)">{{ item.name }}</button>
</div>
`