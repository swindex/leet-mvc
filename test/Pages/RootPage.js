import { TestArrayPage } from "./TestArrayPage";
import { TestFormsPage } from "./TestFormsPage";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { TestFileUploadPage } from "./TestFileUploadPage";
import { TestChangeWatcher } from "./TestChangeWatcher";
import { TestFormsVisiblePage } from "./TestFormsVisiblePage";
import { TestComponentPage } from "./TestComponentPage";

export class RootPage extends HeaderPage{
	constructor(){
		super()

		this.pages = [
			{page: TestArrayPage, name: "Test Array Page"},
			{page: TestFormsPage, name: "Test Forms Page"},
			{page: TestFileUploadPage, name: "Test File upload"},

			{page: TestChangeWatcher, name: "Test Change Watcher"},
      {page: TestFormsVisiblePage, name: "Test Forms Visible"},
      
      {page: TestComponentPage, name: "Test Component"},
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