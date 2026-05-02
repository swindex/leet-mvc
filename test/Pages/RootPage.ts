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
import { TestNumericKeyboardPage } from "./TestNumericKeyboardPage";
import { TestGridPage } from "./TestGridPage";

export class RootPage extends HeaderPage {
  pages: { page: any; name: string }[];
  private isLoadingFromUrl: boolean = false;

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
      { page: TestProjectedContentPage, name: "Test Projected Content" },
      { page: TestNumericKeyboardPage, name: "Test Numeric Keyboard" },
      { page: TestGridPage, name: "Test Grid Layout" }

    ];

    // Bind the popstate handler to this instance
    this.onPopStateHandler = this.onPopStateHandler.bind(this);
  }

  onInit(): void {
  
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', this.onPopStateHandler);
    
    // Check if URL has a page parameter and load it
    this.loadPageFromUrl();
  }

  onDestroy(): void {
    // Clean up event listener
    window.removeEventListener('popstate', this.onPopStateHandler);
    super.onDestroy();
  }

  private onPopStateHandler(): void {
    // Load page from URL when browser back/forward is used
    this.loadPageFromUrl();
  }

  private loadPageFromUrl(): void {
    const hash = window.location.hash;
    
    if (!hash) {
      return;
    }

    // Parse hash: #page=0 or #page=TestArrayPage
    const match = hash.match(/#page=(.+)/);
    if (!match) {
      return;
    }

    const pageParam = match[1];
    
    // Try to parse as index number
    const pageIndex = parseInt(pageParam, 10);
    
    if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < this.pages.length) {
      // Load by index
      this.isLoadingFromUrl = true;
      this.loadPage(pageIndex);
      this.isLoadingFromUrl = false;
    } else {
      // Try to find by name
      const pageIndexByName = this.pages.findIndex(p => 
        p.name.toLowerCase().replace(/\s+/g, '-') === pageParam.toLowerCase() ||
        p.page.name === pageParam
      );
      
      if (pageIndexByName !== -1) {
        this.isLoadingFromUrl = true;
        this.loadPage(pageIndexByName);
        this.isLoadingFromUrl = false;
      }
    }
  }

  loadPage(index: number): void {
    if (index < 0 || index >= this.pages.length) {
      console.warn('Invalid page index:', index);
      return;
    }

    var p = this.Nav.push(this.pages[index].page);
    p.backButton = true;

    // Update URL only if not already loading from URL
    if (!this.isLoadingFromUrl) {
      const pageHash = `#page=${index}`;
      
      // Update URL without triggering popstate
      if (window.location.hash !== pageHash) {
        window.history.pushState({ pageIndex: index }, '', pageHash);
      }
    }
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