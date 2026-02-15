// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from "../../components/BaseComponent";
import { RegisterComponent } from "../../core/Register";
import { BasePage } from "../../pages/BasePage";

// ─── Card Component with Content Projection ──────────────────────────────────



// ─── Test Page ───────────────────────────────────────────────────────────────

export class TestSimpleHtmlContentPage extends BasePage {
  counter: number;

  constructor() {
    super();
    this.title = "Test Projected Content";
    this.counter = 0;
    this.showComponents = false;

    this.htmlText = htmlTemplate
    this.htmlTextWith2Children = htmlTextWith2Children
    this.htmlTextWith1Children = htmlTextWith1Children
    this.htmlTextWithSub = htmlTextWithSub
  }

  onIncrement() {
    this.counter++;
  }

  get template() {
    return super.extendTemplate(super.template, template_all);
  }
}

var htmlTemplate = `
    <p>I am hosted content! Counter: {{ this.counter }}</p>
    <button onclick="this.onIncrement()">Increment from inside</button>
`

var htmlTextWith1Children = `
    <p [if]="this.showComponents">I am hosted content with 1 child! Counter: {{ this.counter }}</p>
`

var htmlTextWithSub = `
    <p [html]="this.htmlTextWith1Children"></p>
`


var htmlTextWith2Children = `
    <p [if]="this.showComponents">I am hosted content with 2 children! Counter: {{ this.counter }}</p>
    <button [if]="this.showComponents" onclick="this.onIncrement()">Increment from inside</button>
`

var template_all = `
    <div style="padding:10px;">
        <h1>Content Projection Test</h1>
        
        <p>Counter: <strong>{{ this.counter }}</strong> <button onclick="this.onIncrement()">Increment</button></p>

        <p>Visibility: <strong>{{ this.showComponents }}</strong> <button onclick="this.showComponents = !this.showComponents">Toggle Visibility</button></p>

        <h2>1 . Mounted HTML Instance (always visible)</h2>
        <p>
            &lt;div [html]="this.htmlText"&gt;&lt;/div&gt;
        </p>
        <div [html]="this.htmlText"></div>

        <h2>2 . Mounted HTML Instance</h2>
        <p>
            &lt;div [html]="this.htmlText" [if]="this.showComponents"&gt;&lt;/div&gt;
        </p>
        <div [html]="this.htmlText" [if]="this.showComponents"></div>

        <h2>3 . Mounted HTML Instance with 2 children</h2>
        <p>
            &lt;div [html]="this.htmlTextWith2Children"&gt;&lt;/div&gt;
        </p>
        <div [html]="this.htmlTextWith2Children"></div>

        <h2>4 . Mounted HTML Instance with 1 children</h2>
        <p>
            &lt;div [html]="this.htmlTextWith1Children"&gt;&lt;/div&gt;
        </p>
        <div [html]="this.htmlTextWith1Children"></div>

        <h2>4 . Mounted HTML Instance with 1 sub child</h2>
        <p>
            &lt;div [html]="this.htmlTextWithSub"&gt;&lt;/div&gt;
        </p>
        <div [html]="this.htmlTextWithSub"></div>

    </div>
`


