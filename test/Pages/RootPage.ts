import { TestArrayPage } from "./TestArrayPage";
import { TestFormsPage } from "./TestFormsPage";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { TestFileUploadPage } from "./TestFileUploadPage";
import { TestChangeWatcher } from "./TestChangeWatcher";
import { TestFormsVisiblePage } from "./TestFormsVisiblePage";
import { TestFormsSelectItemsPage } from "./TestFormsSelectItemsPage";
import { RouterTestPage } from "./RouterTest";
import { TestRegisterComponentPage } from "./TestRegisterComponentPage";
import { TestInConstructorComponentPage } from "./TestInConstructorComponentPage";
import { TestDirectivesPage } from "./TestDirectivesPage";
import { TestBindDirectivePage } from "./TestBindDirectivePage";
import { TestAttributesPage } from "./TestAttributesPage";
import { TestHtmlContentPage } from "./TestHtmlContentPage";
import { TestNestedDirectivesPage } from "./TestNestedDirectivesPage";
import { TestTransitionsPage } from "./TestTransitionsPage";
import { TestDialogPage } from "./TestDialogPage";
import { TestSimpleTabsPage } from "./TestSimpleTabsPage";
import { TestProjectedContentPage } from "./TestProjectedContentPage";

export class RootPage extends HeaderPage {
  pages: { page: any; name: string }[];

  constructor() {
    super();

    this.pages = [
      { page: TestArrayPage, name: "Test Array Page" },
      { page: TestFormsPage, name: "Test Forms Page" },
      { page: TestFileUploadPage, name: "Test File upload" },

      { page: TestChangeWatcher, name: "Test Change Watcher" },
      { page: TestFormsVisiblePage, name: "Test Forms Visible" },

      { page: TestFormsSelectItemsPage, name: "Test Forms Select Items" },
      { page: RouterTestPage, name: "Router Test" },
      { page: TestRegisterComponentPage, name: "Test RegisterComponent" },
      { page: TestInConstructorComponentPage, name: "Test In-Constructor Component" },
      
      { page: TestDirectivesPage, name: "Test Directives ([if], [show], [display])" },
      { page: TestBindDirectivePage, name: "Test [bind] Directive" },
      { page: TestAttributesPage, name: "Test Attribute Directives" },
      { page: TestHtmlContentPage, name: "Test HTML Content & Expressions" },
      { page: TestTransitionsPage, name: "Test [transition] Directive" },
      { page: TestNestedDirectivesPage, name: "Test Nested Directives" },
      { page: TestDialogPage, name: "Test Dialog Component" },
      { page: TestSimpleTabsPage, name: "Test SimpleTabs Component" },
      { page: TestProjectedContentPage, name: "Test Projected Content" }
    ];

  }

  loadPage(index: number): void {

    var p = this.Nav.push(this.pages[index].page);
    p.backButton = true;
  }

  get template(): string {
    return super.extendTemplate(super.template, template);
  }
}

var template = `
<div [foreach]="index in this.pages as item">
	<button onclick="this.loadPage(index)">{{ item.name }}</button>
</div>
`;