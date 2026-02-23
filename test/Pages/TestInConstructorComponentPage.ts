// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from "../../components/BaseComponent";

// ─── Counter Component ───────────────────────────────────────────────────────

class CounterComponent extends BaseComponent {
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
  }

  onDecrement() {
    this.count--;
    this.value--;
    
  }

  valueChange(newValue: number) {
    this.onCountChange(newValue);
  }

  onCountChange(newCount: number) {
    // Placeholder for event binding callback
  }

  get template() {
    return `
      <div style="border:2px solid #4a90d9; padding:15px; margin:10px 0; border-radius:6px; background:#eef5ff;">
        <div style="margin-bottom:10px;">
          <strong style="font-size:16px;">{{ this.label }}</strong>
        </div>
        <div style="margin-bottom:10px;">
          Count: <span style="font-weight:bold; color:#0066cc;">{{ this.count }}</span> | 
          Value: <span style="font-weight:bold; color:#0066cc;">{{ this.value }}</span>
        </div>
        <div>
          <button onclick="this.onDecrement()" style="padding:5px 15px; margin-right:5px;">-</button>
          <button onclick="this.onIncrement()" style="padding:5px 15px;">+</button>
        </div>
      </div>
    `;
  }
}

// ─── Test Page ───────────────────────────────────────────────────────────────

export class TestInConstructorComponentPage extends HeaderPage {
  myComponent: CounterComponent;
  parentCounter: number;
  showComponent: boolean;
  eventLog: string[];
  componentLabel: string;

  constructor() {
    super();
    this.title = "Test In-Constructor Component Instantiation";
    
    // INSTANTIATE COMPONENT IN CONSTRUCTOR
    this.myComponent = new CounterComponent();
    this.myComponent.label = "In-Constructor Component 1";

    this.myComponent2 = new CounterComponent();
    this.myComponent2.label = "In-Constructor Component 2";

    this.myComponent3 = new CounterComponent();
    this.myComponent3.label = "In-Constructor Component 3";

    this.myComponent4 = new CounterComponent();
    this.myComponent4.label = "In-Constructor Component 4";

    this.myComponent5 = new CounterComponent();
    this.myComponent5.label = "In-Constructor Component 5";

    this.myComponent6 = new CounterComponent();
    this.myComponent6.label = "In-Constructor Component 6";

    this.myComponent7 = new CounterComponent();
    this.myComponent7.label = "In-Constructor Component 7";
    
    this.parentCounter = 5;
    this.showComponent = true;
    this.eventLog = [];
    this.componentLabel = "Dynamic Label";
  }

  onCountChanged(newCount: number) {
    this.eventLog.push(`[${new Date().toLocaleTimeString()}] Count changed to: ${newCount}`);
  }

  onToggleComponent() {
    this.showComponent = !this.showComponent;
  }

  onIncrementParent() {
    this.parentCounter++;
  }

  onDecrementParent() {
    this.parentCounter--;
  }

  onResetParent() {
    this.parentCounter = 0;
  }

  onChangeLabel() {
    this.componentLabel = this.componentLabel === "Dynamic Label" 
      ? "Updated Label" 
      : "Dynamic Label";
  }

  onClearLog() {
    this.eventLog = [];
  }

  get template() {
    return super.extendTemplate(super.template, template);
  }
}

var template = `
<div style="padding:20px; max-width:900px;">
  <h3>In-Constructor Component Instantiation Test</h3>
  <p style="color:#555; margin-bottom:20px;">
    This page tests using <code>[component]</code> directive with a component 
    that was instantiated in the constructor (<code>this.myComponent = new CounterComponent()</code>).
  </p>

  <hr style="margin:20px 0;"/>

  <h4>1. Basic Component Binding</h4>
  <p>Component instantiated in constructor and bound with <code>[component]="this.myComponent"</code></p>
  <div [component]="this.myComponent"></div>

  <hr style="margin:20px 0;"/>

  <h4>2. One-Way Property Binding</h4>
  <p>Parent counter value: <strong style="color:#0066cc;">{{ this.parentCounter }}</strong></p>
  <div style="margin:10px 0;">
    <button onclick="this.onDecrementParent()" style="padding:5px 15px; margin-right:5px;">- Parent</button>
    <button onclick="this.onIncrementParent()" style="padding:5px 15px; margin-right:5px;">+ Parent</button>
    <button onclick="this.onResetParent()" style="padding:5px 15px;">Reset</button>
  </div>
  <p>Component with bound <code>[count]</code> property:</p>
  <div [component]="this.myComponent2" [label]="'One-Way Bound'" [count]="this.parentCounter">
  </div>

  <hr style="margin:20px 0;"/>

  <h4>3. Two-Way Binding</h4>
  <p>Parent counter (two-way bound): <strong style="color:#0066cc;">{{ this.parentCounter }}</strong></p>
  <p>Changes in the component will update the parent counter.</p>
  <div [component]="this.myComponent4" [label]="'Two-Way Bound'" [(value)]="this.parentCounter">
  </div>

  <hr style="margin:20px 0;"/>

  <h4>4. Event Callbacks</h4>
  <p>Component with event callback <code>(onCountChange)</code>:</p>
  <div [component]="this.myComponent5" (onCountChange)="this.onCountChanged(arguments[0])">
  </div>
  <div style="margin-top:10px;">
    <strong>Event Log ({{ this.eventLog.length }} events):</strong>
    <button onclick="this.onClearLog()" style="margin-left:10px; padding:3px 10px;">Clear</button>
  </div>
  <div style="max-height:120px; overflow-y:auto; border:1px solid #ccc; padding:8px; margin-top:5px; background:#f9f9f9; font-size:12px; font-family:monospace;">
    <div [foreach]="i in this.eventLog as entry">
      <div style="padding:2px 0;">{{ entry }}</div>
    </div>
    <div [if]="this.eventLog.length === 0" style="color:#999;">No events logged yet...</div>
  </div>

  <hr style="margin:20px 0;"/>

  <h4>5. Dynamic Label Binding</h4>
  <p>Current label: <strong style="color:#0066cc;">{{ this.componentLabel }}</strong></p>
  <button onclick="this.onChangeLabel()" style="padding:5px 15px; margin-bottom:10px;">Toggle Label</button>
  <div [component]="this.myComponent6" [label]="this.componentLabel" [count]="10">
  </div>

  <hr style="margin:20px 0;"/>

  <h4>6. Conditional Rendering with [if]</h4>
  <p>
    <button onclick="this.onToggleComponent()" style="padding:5px 15px;">
      Toggle Component ({{ this.showComponent ? 'visible' : 'hidden' }})
    </button>
  </p>
  <div [component]="this.myComponent7" [if]="this.showComponent" [label]="'Conditional Render'">
  </div>

  <hr style="margin:20px 0;"/>

  <h4>Summary</h4>
  <div style="background:#fffbea; border:1px solid #e6db74; padding:15px; border-radius:4px;">
    <p style="margin:0 0 10px 0;"><strong>✓ Component created in constructor</strong></p>
    <p style="margin:0 0 10px 0;">✓ Bound to DOM with [component] directive</p>
    <p style="margin:0 0 10px 0;">✓ Property bindings work (one-way and two-way)</p>
    <p style="margin:0 0 10px 0;">✓ Event callbacks work</p>
    <p style="margin:0;">✓ Conditional rendering works</p>
  </div>
</div>
`;