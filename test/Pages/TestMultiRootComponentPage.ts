// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from "../../components/BaseComponent";
import { RegisterComponent } from "../../core/Register";

// ─── Single Root Component ───────────────────────────────────────────────────
// This component has ONE root element containing children

class SingleRootComponent extends BaseComponent {
  title: string;
  content: string;

  constructor() {
    super();
    this.title = "Single Root";
    this.content = "Content";
  }

  get template() {
    return `
      <div class="single-root" style="border:2px solid #2ecc71; padding:15px; margin:10px 0; border-radius:6px; background:#e8f8f5;">
        <h3 style="margin:0 0 10px 0; color:#27ae60;">{{ this.title }}</h3>
        <p style="margin:0 0 10px 0; color:#555;">{{ this.content }}</p>
        <div class="children-container" style="padding:10px; background:#fff; border-radius:4px;">
          <strong>Children:</strong>
          <div style="margin-top:5px;">
            <content></content>
          </div>
        </div>
      </div>
    `;
  }
}

// ─── Multi Root Component ────────────────────────────────────────────────────
// This component has MULTIPLE root elements (siblings)

class MultiRootComponent extends BaseComponent {
  header: string;
  body: string;
  footer: string;

  constructor() {
    super();
    this.header = "Header";
    this.body = "Body";
    this.footer = "Footer";
  }

  get template() {
    return `
      <div class="multi-root-header" style="border:2px solid #3498db; padding:10px; margin:5px 0; border-radius:6px 6px 0 0; background:#ebf5fb;">
        <strong style="color:#2980b9;">{{ this.header }}</strong>
      </div>
      <div class="multi-root-body" style="border:2px solid #3498db; border-top:none; border-bottom:none; padding:10px; margin:0; background:#fff;">
        <p style="margin:0; color:#555;">{{ this.body }}</p>
        <div class="children-container" style="margin-top:10px; padding:8px; background:#f8f9fa; border-radius:4px;">
          <em>Children content:</em>
          <div style="margin-top:5px;">
            <content></content>
          </div>
        </div>
      </div>
      <div class="multi-root-footer" style="border:2px solid #3498db; padding:10px; margin:5px 0 10px 0; border-radius:0 0 6px 6px; background:#ebf5fb;">
        <small style="color:#7f8c8d;">{{ this.footer }}</small>
      </div>
    `;
  }
}

// ─── Test Page ───────────────────────────────────────────────────────────────

export class TestMultiRootComponentPage extends HeaderPage {
  singleTitle: string;
  singleContent: string;
  multiHeader: string;
  multiBody: string;
  multiFooter: string;
  showSingle: boolean;
  showMulti: boolean;
  counter: number;

  constructor() {
    super();
    this.title = "Test Multi-Root Components";
    this.singleTitle = "Dynamic Single Root Title";
    this.singleContent = "This is dynamic content for single root.";
    this.multiHeader = "Dynamic Multi Header";
    this.multiBody = "This is dynamic body content for multi-root component.";
    this.multiFooter = "Dynamic Multi Footer";
    this.showSingle = true;
    this.showMulti = true;
    this.counter = 0;

    RegisterComponent(SingleRootComponent, 'app-single-root');
    RegisterComponent(MultiRootComponent, 'app-multi-root');
  }

  onToggleSingle() {
    this.showSingle = !this.showSingle;
  }

  onToggleMulti() {
    this.showMulti = !this.showMulti;
  }

  onIncrementCounter() {
    this.counter++;
  }

  onUpdateSingle() {
    this.singleTitle = "Updated Single Title";
    this.singleContent = "Updated single content.";
  }

  onUpdateMulti() {
    this.multiHeader = "Updated Multi Header";
    this.multiBody = "Updated multi body.";
    this.multiFooter = "Updated Multi Footer";
  }

  onResetAll() {
    this.singleTitle = "Dynamic Single Root Title";
    this.singleContent = "This is dynamic content for single root.";
    this.multiHeader = "Dynamic Multi Header";
    this.multiBody = "This is dynamic body content for multi-root component.";
    this.multiFooter = "Dynamic Multi Footer";
    this.counter = 0;
  }

  get template() {
    return super.extendTemplate(super.template, template);
  }
}

var template = `
<div style="padding:10px;">
  <h3>Multi-Root vs Single-Root Component Template Test</h3>
  
  <hr/>
  <h4>1. Single Root Component - Basic Rendering</h4>
  <div id="test-section-single-basic">
    <p>Component with ONE root element:</p>
    <div id="single-basic-instance">
      <app-single-root [title]="'Static Title'" [content]="'Static content in single root component.'">
        <span style="color:#e74c3c;">Child element 1</span>
      </app-single-root>
    </div>
  </div>

  <hr/>
  <h4>2. Single Root Component - Dynamic Binding</h4>
  <div id="test-section-single-dynamic">
    <p>
      <button onclick="this.onUpdateSingle()">Update Single Root Props</button>
    </p>
    <div id="single-dynamic-instance">
      <app-single-root [title]="this.singleTitle" [content]="this.singleContent">
        <div style="padding:5px; background:#ffeaa7; border-radius:3px;">
          <strong>Dynamic child content</strong>
          <p style="margin:5px 0 0 0;">Counter: {{ this.counter }}</p>
        </div>
      </app-single-root>
    </div>
  </div>

  <hr/>
  <h4>3. Multi-Root Component - Basic Rendering</h4>
  <div id="test-section-multi-basic">
    <p>Component with MULTIPLE root elements (DocumentFragment):</p>
    <div id="multi-basic-instance">
      <app-multi-root [header]="'Static Header'" [body]="'Static body text.'" [footer]="'Static Footer'">
        <span style="color:#9b59b6;">Multi-root child element</span>
      </app-multi-root>
    </div>
  </div>

  <hr/>
  <h4>4. Multi-Root Component - Dynamic Binding</h4>
  <div id="test-section-multi-dynamic">
    <p>
      <button onclick="this.onUpdateMulti()">Update Multi-Root Props</button>
    </p>
    <div id="multi-dynamic-instance">
      <app-multi-root [header]="this.multiHeader" [body]="this.multiBody" [footer]="this.multiFooter">
        <div style="padding:5px; background:#dfe6e9; border-radius:3px;">
          <strong>Dynamic multi-root child</strong>
          <p style="margin:5px 0 0 0;">Counter: {{ this.counter }}</p>
        </div>
      </app-multi-root>
    </div>
  </div>

  <hr/>
  <h4>5. Conditional Rendering with [if] Directive</h4>
  <div id="test-section-conditional">
    <p>
      <button onclick="this.onToggleSingle()">Toggle Single Root ({{ this.showSingle ? 'visible' : 'hidden' }})</button>
      <button onclick="this.onToggleMulti()">Toggle Multi Root ({{ this.showMulti ? 'visible' : 'hidden' }})</button>
    </p>
    
    <div style="margin:10px 0;">
      <strong>Single Root (conditional):</strong>
      <div id="single-conditional-instance">
        <app-single-root [if]="this.showSingle" [title]="'Conditional Single'" [content]="'This appears when showSingle is true.'">
          <span style="color:#00b894;">Conditional single child</span>
        </app-single-root>
      </div>
    </div>
    
    <div style="margin:10px 0;">
      <strong>Multi Root (conditional):</strong>
      <div id="multi-conditional-instance">
        <app-multi-root [if]="this.showMulti" [header]="'Conditional Header'" [body]="'This appears when showMulti is true.'" [footer]="'Conditional Footer'">
          <span style="color:#fd79a8;">Conditional multi child</span>
        </app-multi-root>
      </div>
    </div>
  </div>

  <hr/>
  <h4>6. Multiple Instances</h4>
  <div id="test-section-multiple-instances">
    <p>Counter: <strong>{{ this.counter }}</strong> <button onclick="this.onIncrementCounter()">Increment</button></p>
    
    <div style="margin:10px 0;">
      <strong>Two Single Root instances:</strong>
      <div id="single-instance-a">
        <app-single-root [title]="'Instance A'" [content]="'Single root instance A'">
          <span>Child A ({{ this.counter }})</span>
        </app-single-root>
      </div>
      <div id="single-instance-b">
        <app-single-root [title]="'Instance B'" [content]="'Single root instance B'">
          <span>Child B ({{ this.counter }})</span>
        </app-single-root>
      </div>
    </div>
    
    <div style="margin:10px 0;">
      <strong>Two Multi Root instances:</strong>
      <div id="multi-instance-1">
        <app-multi-root [header]="'Multi Instance 1'" [body]="'Body 1'" [footer]="'Footer 1'">
          <span>Multi Child 1 ({{ this.counter }})</span>
        </app-multi-root>
      </div>
      <div id="multi-instance-2">
        <app-multi-root [header]="'Multi Instance 2'" [body]="'Body 2'" [footer]="'Footer 2'">
          <span>Multi Child 2 ({{ this.counter }})</span>
        </app-multi-root>
      </div>
    </div>
  </div>

  <hr/>
  <h4>7. Mixed Components with Children</h4>
  <div id="test-section-mixed">
    <p>
      <button onclick="this.onResetAll()">Reset All</button>
    </p>
    <div id="mixed-nested-instance">
      <app-single-root [title]="this.singleTitle" [content]="this.singleContent">
        <div style="padding:10px; border:1px dashed #636e72;">
          <p style="margin:0;">Nested content with counter: {{ this.counter }}</p>
          <app-multi-root [header]="'Nested Multi Header'" [body]="'Nested inside single root'" [footer]="'Nested Footer'">
            <em>Deep nested child</em>
          </app-multi-root>
        </div>
      </app-single-root>
    </div>
  </div>

  <hr/>
  <h4>8. Empty Children Test</h4>
  <div id="test-section-empty-children">
    <p>Components without any children content:</p>
    <div id="empty-single-instance">
      <app-single-root [title]="'No Children Single'" [content]="'This has no child content'">
      </app-single-root>
    </div>
    <div id="empty-multi-instance">
      <app-multi-root [header]="'No Children Multi Header'" [body]="'This has no child content'" [footer]="'No Children Footer'">
      </app-multi-root>
    </div>
  </div>
</div>
`;
