// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from "../../components/BaseComponent";
import { RegisterComponent } from "../../core/Register";

// ─── Simple Info Card Component ──────────────────────────────────────────────

class InfoCard extends BaseComponent {
  title: string;
  description: string;

  constructor() {
    super();
    this.title = "";
    this.description = "";
  }

  get template() {
    return `
      <div class="info-card" style="border:1px solid #999; padding:10px; margin:5px 0; border-radius:4px; background:#f9f9f9;">
        <h4 style="margin:0 0 5px 0;">{{ this.title }}</h4>
        <p style="margin:0; color:#555;">{{ this.description }}</p>
      </div>
    `;
  }
}
// ─── Counter Widget Component ────────────────────────────────────────────────

class CounterWidget extends BaseComponent {
  label: string;
  count: number;
  value: number;

  constructor() {
    super();
    this.label = "Counter";
    this.count = 0;
    this.value = 0;
  }

  onIncrement() {
    this.count++;
    this.value++;
    /*if (typeof this.onCountChange === 'function') {
      this.onCountChange(this.count);
    }
    // Trigger two-way binding update
    if (typeof this.valueChange_2 === 'function') {
      this.valueChange_2(this.value);
    }*/
  }

  valueChange(newValue: number) {
    this.onCountChange(newValue);
  }

  onDecrement() {
    this.count--;
    this.value--;
    /*if (typeof this.onCountChange === 'function') {
      this.onCountChange(this.count);
    }
    if (typeof this.valueChange_2 === 'function') {
      this.valueChange_2(this.value);
    }*/
  }

  // Placeholder for event binding callback
  onCountChange(newCount: number) {
    // Placeholder for event binding callback
  }
  

  get template() {
    return `
      <div style="border:2px solid #4a90d9; padding:10px; margin:5px 0; border-radius:6px; background:#eef5ff; display:inline-block;">
        <strong>{{ this.label }}</strong>: <span>{{ this.count }}</span> (value: <span>{{ this.value }}</span>)
        <button onclick="this.onDecrement()" style="margin-left:8px;">-</button>
        <button onclick="this.onIncrement()">+</button>
      </div>
    `;
  }
}

// ─── Test Page ───────────────────────────────────────────────────────────────

export class TestRegisterComponentPage extends HeaderPage {
  counter: number;
  label: string;
  showWidget: boolean;
  infoTitle: string;
  infoDesc: string;
  eventLog: string[];

  constructor() {
    super();
    this.title = "Test RegisterComponent";
    this.counter = 0;
    this.label = "My Counter";
    this.showWidget = false;
    this.infoTitle = "Info Card Title";
    this.infoDesc = "This is a description passed via property binding.";
    this.eventLog = [];

    RegisterComponent(InfoCard, 'app-info-card');
    RegisterComponent(CounterWidget, 'app-counter-widget');

  }

  onCountChanged(newCount: number) {
    this.eventLog.push("Count changed to: " + newCount);
  }

  onToggleWidget() {
    this.showWidget = !this.showWidget;
  }

  onIncrementFromParent() {
    this.counter++;
  }

  onResetCounter() {
    this.counter = 0;
  }

  onChangeLabel() {
    this.label = this.label === "My Counter" ? "Renamed Counter" : "My Counter";
  }

  onClearLog() {
    this.eventLog = [];
  }

  get template() {
    return super.extendTemplate(super.template, template);
  }
}

var template = `
<div style="padding:10px;">
  <h3>RegisterComponent Custom Element Tag Test</h3>

  <hr/>
  <h4>1. Basic Rendering (app-info-card)</h4>
  <p>Static property binding:</p>
  <app-info-card [title]="'Hello World'" [description]="'This card has static string props.'"></app-info-card>

  <p>Dynamic property binding:</p>
  <app-info-card [title]="this.infoTitle" [description]="this.infoDesc"></app-info-card>

  <hr/>
  <h4>2. Property Binding (app-counter-widget)</h4>
  <p>Parent counter value: <strong>{{ this.counter }}</strong></p>
  <p>
    <button onclick="this.onIncrementFromParent()">Increment from Parent</button>
    <button onclick="this.onResetCounter()">Reset</button>
    <button onclick="this.onChangeLabel()">Toggle Label</button>
  </p>
  <app-counter-widget [label]="this.label" [count]="this.counter"></app-counter-widget>

  <hr/>
  <h4>3. Two-Way Binding [(value)]</h4>
  <p>Parent counter (two-way bound): <strong>{{ this.counter }}</strong></p>
  <app-counter-widget [label]="'Two-Way'" [(value)]="this.counter"></app-counter-widget>

  <hr/>
  <h4>4. Event Binding (onCountChange)</h4>
  <app-counter-widget [label]="'With Events'" (onCountChange)="this.onCountChanged($event)"></app-counter-widget>
  <p>Event log ({{ this.eventLog.length }} events): <button onclick="this.onClearLog()">Clear</button></p>
  <div style="max-height:100px; overflow-y:auto; border:1px solid #ccc; padding:4px; font-size:12px;">
    <div [foreach]="i in this.eventLog as entry">
      <div>{{ entry }}</div>
    </div>
  </div>

  <hr/>
  <h4>5. Conditional Rendering [if]</h4>
  <p>
    <button onclick="this.onToggleWidget()">Toggle Widget ({{ this.showWidget ? 'visible' : 'hidden' }})</button>
  </p>
  <div>
    If directive on component template:
  </div>
  <app-counter-widget [if]="this.showWidget" [label]="'Conditional'"></app-counter-widget>

  <!--<div>
    If directive outside component template:
  </div>
  <div [if]="this.showWidget">
    <app-counter-widget [label]="'Conditional Inside'" [count]="10">
    </app-counter-widget>
  </div>-->

  <hr/>
  <h4>6. Multiple Instances</h4>
  <app-counter-widget [label]="'Instance A'"></app-counter-widget>
  <app-counter-widget [label]="'Instance B'"></app-counter-widget>
</div>
`;

template = `
<div style="padding:10px;">
  <h4>5. Conditional Rendering [if]</h4>
  <p>
    <button onclick="this.onToggleWidget()">Toggle Widget ({{ this.showWidget ? 'visible' : 'hidden' }})</button>
  </p>
  <div>
    If directive on component template:
  </div>
  <app-counter-widget [label]="'Always visible'"></app-counter-widget>
  
  <app-counter-widget [if]="this.showWidget" [label]="'Conditional Off by default'"></app-counter-widget>

  <app-counter-widget [if]="!this.showWidget" [label]="'Conditional On by default'" [count]="10"></app-counter-widget>
</div>`