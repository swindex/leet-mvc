// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from "../../components/BaseComponent";
import { RegisterComponent } from "../../core/Register";
import { BasePage } from "../../pages/BasePage";

// ─── Card Component with Content Projection ──────────────────────────────────

class CardComponent extends BaseComponent {
  title: string;

  constructor() {
    super();
    this.title = "";
  }

  get template() {
    return `
      <div style="border:2px solid #3498db; padding:15px; margin:10px 0; border-radius:6px; background:#ebf5fb;">
        <h3 style="margin:0 0 10px 0; color:#2980b9;">Card Title: {{ this.title }}</h3>
        <h3>Hosted Content:</h3>
        <div style="padding:10px; background:#fff; border-radius:4px;">
            <content></content>
        </div>
      </div>
    `;
  }
}

// ─── Test Page ───────────────────────────────────────────────────────────────

export class TestProjectedContentPage extends BasePage {
  counter: number;

  constructor() {
    super();
    this.title = "Test Projected Content";
    this.counter = 0;
    this.showComponents = false;

    RegisterComponent(CardComponent, 'app-card');

    this.compInstance = new CardComponent()

  }

  onIncrement() {
    this.counter++;
  }

  get template() {
    return super.extendTemplate(super.template, template_all);
  }
}

var template_all = `
    <div style="padding:10px;">
        <h1>Content Projection Test</h1>
        
        <p>Counter: <strong>{{ this.counter }}</strong> <button onclick="this.onIncrement()">Increment</button></p>

        <p>Visibility: <strong>{{ this.showComponents }}</strong> <button onclick="this.showComponents = !this.showComponents">Toggle Visibility</button></p>

        <h2>1 . Registered Component</h2>
        <p>
            &lt;app-card [component]="this.compInstance" [if]="this.showComponents"&gt;...hosted children...&lt;/app-card&gt;
        </p>
        <app-card [title]="'Multiple Elements'" [if]="this.showComponents">
            <p>I am hosted content! Counter: {{ this.counter }}</p>
            <button onclick="this.onIncrement()">Increment from inside</button>
        </app-card>

        <h2>2 . Mounted Component Instance</h2>
        <p>
            &lt;div [component]="this.compInstance" [if]="this.showComponents"&gt;...hosted children...&lt;/div&gt;
        </p>
        <div [component]="this.compInstance" [title]="'Multiple Elements'" [if]="this.showComponents">
            <p>I am hosted content! Counter: {{ this.counter }}</p>
            <button onclick="this.onIncrement()">Increment from inside</button>
        </div>

    </div>
`


