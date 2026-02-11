// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";

export class TestAttributesPage extends HeaderPage {
  dynamicAttributes: Record<string, any>;
  dynamicStyles: Record<string, any>;
  dynamicClass: string;
  selectedOption: string;
  isDisabled: boolean;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  borderWidth: number;

  constructor() {
    super();
    
    this.dynamicAttributes = {
      'data-custom': 'custom-value',
      'title': 'Hover over me!',
      'aria-label': 'Accessible label'
    };
    
    this.dynamicStyles = {
      padding: '15px',
      border: '2px solid blue',
      borderRadius: '8px',
      backgroundColor: 'lightblue'
    };
    
    this.dynamicClass = 'highlight';
    this.selectedOption = 'option2';
    this.isDisabled = false;
    this.fontSize = 16;
    this.backgroundColor = '#f0f0f0';
    this.textColor = '#333333';
    this.borderWidth = 2;
  }

  addAttribute() {
    const key = 'data-timestamp';
    const value = Date.now().toString();
    this.dynamicAttributes[key] = value;
  }

  removeAttribute() {
    delete this.dynamicAttributes['data-custom'];
  }

  toggleDisabled() {
    this.isDisabled = !this.isDisabled;
    if (this.isDisabled) {
      this.dynamicAttributes['disabled'] = 'disabled';
    } else {
      this.dynamicAttributes['disabled'] = null;
    }
  }

  updateStyles(property: string, value: string) {
    this.dynamicStyles[property] = value;
  }

  increaseFontSize() {
    this.fontSize += 2;
    this.dynamicStyles.fontSize = this.fontSize + 'px';
  }

  decreaseFontSize() {
    if (this.fontSize > 8) {
      this.fontSize -= 2;
      this.dynamicStyles.fontSize = this.fontSize + 'px';
    }
  }

  changeBackgroundColor(color: string) {
    this.backgroundColor = color;
    this.dynamicStyles.backgroundColor = color;
  }

  changeTextColor(color: string) {
    this.textColor = color;
    this.dynamicStyles.color = color;
  }

  changeBorder() {
    this.borderWidth = this.borderWidth === 2 ? 5 : 2;
    this.dynamicStyles.border = `${this.borderWidth}px solid ${this.borderWidth === 2 ? 'blue' : 'red'}`;
  }

  setClass(className: string) {
    this.dynamicClass = className;
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="fill scroll" style="padding: 20px;">
        <h2>[attribute] Directive Tests</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Dynamic Attributes:</strong></p>
          <button onclick="this.addAttribute()" class="btn btn-primary">Add Timestamp Attribute</button>
          <button onclick="this.removeAttribute()" class="btn btn-danger">Remove Custom Attribute</button>
          <button onclick="this.toggleDisabled()" class="btn btn-secondary">
            Toggle Disabled ({{ this.isDisabled ? 'enabled' : 'disabled' }})
          </button>
          
          <div [attribute]="this.dynamicAttributes" 
               style="margin-top: 10px; padding: 15px; background: lightgray; border: 2px solid #333;">
            <strong>Element with dynamic attributes</strong>
            <p>Inspect this element to see the dynamic attributes!</p>
            <p>Current attributes: {{ JSON.stringify(this.dynamicAttributes) }}</p>
          </div>
        </div>

        <hr>

        <h2>[style] Directive Tests</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Dynamic Styles:</strong></p>
          
          <div style="margin-bottom: 10px;">
            <button onclick="this.increaseFontSize()" class="btn btn-primary">Increase Font</button>
            <button onclick="this.decreaseFontSize()" class="btn btn-primary">Decrease Font</button>
            <span style="margin-left: 10px;">Current: {{ this.fontSize }}px</span>
          </div>

          <div style="margin-bottom: 10px;">
            <button onclick="this.changeBackgroundColor('lightblue')" class="btn btn-primary">Blue BG</button>
            <button onclick="this.changeBackgroundColor('lightgreen')" class="btn btn-primary">Green BG</button>
            <button onclick="this.changeBackgroundColor('lightcoral')" class="btn btn-primary">Red BG</button>
            <button onclick="this.changeBackgroundColor('#f0f0f0')" class="btn btn-secondary">Reset BG</button>
          </div>

          <div style="margin-bottom: 10px;">
            <button onclick="this.changeTextColor('#333333')" class="btn btn-primary">Dark Text</button>
            <button onclick="this.changeTextColor('#0000ff')" class="btn btn-primary">Blue Text</button>
            <button onclick="this.changeTextColor('#ff0000')" class="btn btn-primary">Red Text</button>
          </div>

          <div style="margin-bottom: 10px;">
            <button onclick="this.changeBorder()" class="btn btn-primary">Toggle Border</button>
          </div>
          
          <div [style]="this.dynamicStyles">
            <strong>Styled Element</strong>
            <p>This element's styles are controlled by the [style] directive</p>
            <p>All inline styles are dynamically applied from the style object</p>
          </div>

          <div style="margin-top: 10px; padding: 10px; background: #f9f9f9;">
            <strong>Current Style Object:</strong>
            <pre style="margin: 5px 0; font-size: 12px;">{{ JSON.stringify(this.dynamicStyles, null, 2) }}</pre>
          </div>
        </div>

        <hr>

        <h2>[class] Directive Tests</h2>
        
        <style>
          .highlight { background-color: yellow; padding: 10px; }
          .success { background-color: lightgreen; padding: 10px; color: darkgreen; font-weight: bold; }
          .error { background-color: lightcoral; padding: 10px; color: darkred; font-weight: bold; }
          .warning { background-color: lightyellow; padding: 10px; color: darkorange; border-left: 4px solid orange; }
          .info { background-color: lightblue; padding: 10px; color: darkblue; border-left: 4px solid blue; }
        </style>

        <div style="margin-bottom: 20px;">
          <p><strong>Dynamic CSS Classes:</strong></p>
          
          <button onclick="this.setClass('highlight')" class="btn btn-primary">Highlight</button>
          <button onclick="this.setClass('success')" class="btn btn-success">Success</button>
          <button onclick="this.setClass('error')" class="btn btn-danger">Error</button>
          <button onclick="this.setClass('warning')" class="btn btn-warning">Warning</button>
          <button onclick="this.setClass('info')" class="btn btn-info">Info</button>
          <button onclick="this.setClass('')" class="btn btn-secondary">Clear</button>
          
          <div [class]="this.dynamicClass" style="margin-top: 10px; min-height: 50px;">
            <strong>Dynamic Class Element</strong>
            <p>Current class: <code>{{ this.dynamicClass || '(none)' }}</code></p>
          </div>
        </div>

        <hr>

        <h2>[selected] Directive Tests</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Selected Attribute on Options:</strong></p>
          
          <label style="display: block; margin-bottom: 5px;">
            Select an option:
          </label>
          <select onchange="this.selectedOption = event.target.value" style="width: 100%; padding: 8px; font-size: 14px;">
            <option value="option1" [selected]="this.selectedOption === 'option1'">Option 1</option>
            <option value="option2" [selected]="this.selectedOption === 'option2'">Option 2</option>
            <option value="option3" [selected]="this.selectedOption === 'option3'">Option 3</option>
            <option value="option4" [selected]="this.selectedOption === 'option4'">Option 4</option>
          </select>
          
          <div style="margin-top: 10px;">
            <button onclick="this.selectedOption = 'option1'" class="btn btn-primary">Select Option 1</button>
            <button onclick="this.selectedOption = 'option2'" class="btn btn-primary">Select Option 2</button>
            <button onclick="this.selectedOption = 'option3'" class="btn btn-primary">Select Option 3</button>
            <button onclick="this.selectedOption = 'option4'" class="btn btn-primary">Select Option 4</button>
          </div>
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Currently Selected:</strong> {{ this.selectedOption }}
          </div>
        </div>

        <hr>

        <h2>Combined Attribute Directives</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Element with multiple directives:</strong></p>
          
          <div [attribute]="this.dynamicAttributes"
               [style]="this.dynamicStyles"
               [class]="this.dynamicClass"
               style="margin-top: 10px;">
            <strong>Multi-directive Element</strong>
            <p>This element combines [attribute], [style], and [class] directives</p>
            <ul>
              <li>Attributes: {{ Object.keys(this.dynamicAttributes).length }} applied</li>
              <li>Styles: {{ Object.keys(this.dynamicStyles).length }} properties</li>
              <li>Class: {{ this.dynamicClass || '(none)' }}</li>
            </ul>
          </div>
        </div>

        <hr>

        <h2>Conditional Attributes</h2>
        
        <div style="margin-bottom: 20px;">
          <button [attribute]="{ disabled: this.isDisabled ? 'disabled' : null }"
                  class="btn btn-primary">
            {{ this.isDisabled ? 'Disabled Button' : 'Enabled Button' }}
          </button>
          
          <div style="margin-top: 10px;">
            <button onclick="this.isDisabled = !this.isDisabled" class="btn btn-secondary">
              Toggle Button State
            </button>
          </div>

          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Button is:</strong> {{ this.isDisabled ? 'Disabled' : 'Enabled' }}
          </div>
        </div>

      </div>
    `);
  }
}