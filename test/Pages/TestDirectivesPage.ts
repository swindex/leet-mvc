// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";

export class TestDirectivesPage extends HeaderPage {
  showSection1: boolean;
  showSection2: boolean;
  displayValue: string;
  ifCondition: boolean;
  numberValue: number;
  truthyValue: any;
  nestedCondition: boolean;

  constructor() {
    super();
    
    this.showSection1 = true;
    this.showSection2 = false;
    this.displayValue = "block";
    this.ifCondition = true;
    this.numberValue = 5;
    this.truthyValue = "hello";
    this.nestedCondition = true;
  }

  toggleShow1() {
    this.showSection1 = !this.showSection1;
  }

  toggleShow2() {
    this.showSection2 = !this.showSection2;
  }

  toggleIf() {
    this.ifCondition = !this.ifCondition;
  }

  toggleNested() {
    this.nestedCondition = !this.nestedCondition;
  }

  setDisplay(value: string) {
    this.displayValue = value;
  }

  incrementNumber() {
    this.numberValue++;
  }

  decrementNumber() {
    this.numberValue--;
  }

  toggleTruthy() {
    this.truthyValue = this.truthyValue ? null : "hello";
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="" style="padding: 2.0rem;">
        <h2>[if] Directive Tests</h2>
        
        <div style="margin-bottom: 2.0rem;">
          <button onclick="this.toggleIf()" class="btn btn-primary">
            Toggle If Condition ({{ this.ifCondition ? 'true' : 'false' }})
          </button>
          
          <div [if]="this.ifCondition" style="background: lightgreen; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>✓ This content is conditionally rendered with [if]</strong>
            <p>Current condition value: {{ this.ifCondition }}</p>
          </div>

          <div [if]="!this.ifCondition" style="background: lightcoral; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>✗ Condition is false - alternative content</strong>
          </div>
        </div>

        <hr>

        <h2>[if] with Expressions</h2>
        
        <div style="margin-bottom: 2.0rem;">
          <button onclick="this.incrementNumber()" class="btn btn-primary">Increment</button>
          <button onclick="this.decrementNumber()" class="btn btn-secondary">Decrement</button>
          <span style="margin-left: 1.0rem;">Current value: {{ this.numberValue }}</span>
          
          <div [if]="this.numberValue > 5" style="background: lightyellow; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Number is greater than 5!</strong>
          </div>

          <div [if]="this.numberValue === 5" style="background: lightblue; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Number equals 5!</strong>
          </div>

          <div [if]="this.numberValue < 5" style="background: lightpink; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Number is less than 5!</strong>
          </div>
        </div>

        <hr>

        <h2>[if] with Truthy/Falsy Values</h2>
        
        <div style="margin-bottom: 2.0rem;">
          <button onclick="this.toggleTruthy()" class="btn btn-primary">
            Toggle Truthy Value ({{ this.truthyValue ? 'truthy' : 'falsy' }})
          </button>
          
          <div [if]="this.truthyValue" style="background: lightgreen; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Value is truthy: "{{ this.truthyValue }}"</strong>
          </div>

          <div [if]="!this.truthyValue" style="background: lightgray; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Value is falsy (null/undefined/empty)</strong>
          </div>
        </div>

        <hr>

        <h2>[show] Directive Tests</h2>
        
        <div style="margin-bottom: 2.0rem;">
          <button onclick="this.toggleShow1()" class="btn btn-primary">
            Toggle Show 1 ({{ this.showSection1 ? 'visible' : 'hidden' }})
          </button>
          <button onclick="this.toggleShow2()" class="btn btn-secondary">
            Toggle Show 2 ({{ this.showSection2 ? 'visible' : 'hidden' }})
          </button>
          
          <div [show]="this.showSection1" style="background: lightcyan; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Section 1:</strong> This uses [show] directive (toggles display: none)
            <p>This element stays in the DOM even when hidden</p>
          </div>

          <div [show]="this.showSection2" style="background: lavender; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Section 2:</strong> Another [show] example
            <p>Independent toggle control</p>
          </div>

          <div style="margin-top: 1.0rem; padding: 1.0rem; background: #f0f0f0;">
            <em>Note: [show] uses display:none, keeping elements in DOM. [if] removes/adds elements.</em>
          </div>
        </div>

        <hr>

        <h2>[display] Directive Tests</h2>
        
        <div style="margin-bottom: 2.0rem;">
          <button onclick="this.setDisplay('block')" class="btn btn-primary">Block</button>
          <button onclick="this.setDisplay('inline')" class="btn btn-primary">Inline</button>
          <button onclick="this.setDisplay('inline-block')" class="btn btn-primary">Inline-Block</button>
          <button onclick="this.setDisplay('flex')" class="btn btn-primary">Flex</button>
          <button onclick="this.setDisplay('none')" class="btn btn-danger">None</button>
          
          <div style="margin-top: 1.0rem;">
            Current display value: <strong>{{ this.displayValue }}</strong>
          </div>

          <div [display]="this.displayValue" style="background: lightseagreen; padding: 1.0rem; margin-top: 1.0rem; color: white;">
            <strong>Display Test Element</strong>
            <span style="margin-left: 2.0rem;">This element's display property is controlled by [display]</span>
          </div>
        </div>

        <hr>

        <h2>Nested [if] Conditions</h2>
        
        <div style="margin-bottom: 2.0rem;">
          <button onclick="this.toggleIf()" class="btn btn-primary">
            Toggle Outer ({{ this.ifCondition ? 'true' : 'false' }})
          </button>
          <button onclick="this.toggleNested()" class="btn btn-secondary">
            Toggle Inner ({{ this.nestedCondition ? 'true' : 'false' }})
          </button>
          
          <div [if]="this.ifCondition" style="background: lightblue; padding: 1.0rem; margin-top: 1.0rem;">
            <strong>Outer condition is TRUE</strong>
            
            <div [if]="this.nestedCondition" style="background: lightgreen; padding: 1.0rem; margin-top: 1.0rem;">
              <strong>Inner condition is TRUE</strong>
              <p>Both conditions must be true to see this!</p>
            </div>

            <div [if]="!this.nestedCondition" style="background: lightyellow; padding: 1.0rem; margin-top: 1.0rem;">
              <strong>Inner condition is FALSE</strong>
            </div>
          </div>
        </div>

        <hr>

        <h2>Combined [if] and [show]</h2>
        
        <div style="margin-bottom: 2.0rem;">
          <div [if]="this.ifCondition" style="border: 2px solid blue; padding: 1.0rem;">
            <strong>Parent uses [if] - {{ this.ifCondition }}</strong>
            
            <div [show]="this.showSection1" style="background: lightyellow; padding: 1.0rem; margin-top: 1.0rem;">
              Child uses [show] - {{ this.showSection1 }}
            </div>
          </div>
        </div>

      </div>
    `);
  }
}