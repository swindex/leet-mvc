import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { NumericKeyboard } from "../../pages/NumericKeyboard/NumericKeyboard";

export class TestNumericKeyboardPage extends HeaderPage {
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  currentLayout: number;

  constructor() {
    super();
    
    // Initialize values
    this.number1 = 0;
    this.number2 = 123.45;
    this.number3 = -99;
    this.number4 = 0;
    
    // Enable NumericKeyboard and set default layout
    NumericKeyboard.enable();
    this.currentLayout = 1;
    NumericKeyboard.options.layout = this.currentLayout;
  }

  setLayout(layout: number) {
    this.currentLayout = layout;
    NumericKeyboard.options.layout = layout;
    this.update();
  }

  clearAll() {
    this.number1 = 0;
    this.number2 = 0;
    this.number3 = 0;
    this.number4 = 0;
    this.update();
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="" style="padding: 2.0rem;">
        <h1>Numeric Virtual Keyboard Demo</h1>
        <p>Click on any numeric input below to activate the virtual keyboard.</p>

        <hr>
        <h2>Keyboard Layout Selection</h2>
        <div style="margin-bottom: 1.5rem;">
          <button 
            onclick="this.setLayout(0)" 
            class="btn ${this.currentLayout === 0 ? 'btn-primary' : 'btn-secondary'}"
            style="margin-right: 0.5rem;">
            Layout 0 (Tall Simple)
          </button>
          <button 
            onclick="this.setLayout(1)" 
            class="btn ${this.currentLayout === 1 ? 'btn-primary' : 'btn-secondary'}"
            style="margin-right: 0.5rem;">
            Layout 1 (Tall Full)
          </button>
          <button 
            onclick="this.setLayout(2)" 
            class="btn ${this.currentLayout === 2 ? 'btn-primary' : 'btn-secondary'}">
            Layout 2 (Short Full)
          </button>
        </div>

        <hr>
        <h2>Numeric Input Fields</h2>
        <p>Current Layout: <strong>{{ this.currentLayout }}</strong></p>

        <div style="margin-bottom: 1.5rem;">
          <div style="margin-bottom: 1.0rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">
              Number 1 (Default):
            </label>
            <input 
              type="number" 
              bind="this.number1" 
              style="width: 100%; max-width: 300px; padding: 0.5rem; font-size: 1rem;"
            />
            <div style="margin-top: 0.25rem; color: #666;">
              Current value: {{ this.number1 }}
            </div>
          </div>

          <div style="margin-bottom: 1.0rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">
              Number 2 (With Decimal):
            </label>
            <input 
              type="number" 
              bind="this.number2" 
              style="width: 100%; max-width: 300px; padding: 0.5rem; font-size: 1rem;"
            />
            <div style="margin-top: 0.25rem; color: #666;">
              Current value: {{ this.number2 }}
            </div>
          </div>

          <div style="margin-bottom: 1.0rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">
              Number 3 (Negative Number):
            </label>
            <input 
              type="number" 
              bind="this.number3" 
              style="width: 100%; max-width: 300px; padding: 0.5rem; font-size: 1rem;"
            />
            <div style="margin-top: 0.25rem; color: #666;">
              Current value: {{ this.number3 }}
            </div>
          </div>

          <div style="margin-bottom: 1.0rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">
              Number 4 (Empty):
            </label>
            <input 
              type="number" 
              bind="this.number4" 
              style="width: 100%; max-width: 300px; padding: 0.5rem; font-size: 1rem;"
            />
            <div style="margin-top: 0.25rem; color: #666;">
              Current value: {{ this.number4 }}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <button onclick="this.clearAll()" class="btn btn-danger">
            Clear All Values
          </button>
        </div>

        <hr>
        <h2>Features Demonstrated</h2>
        <div style="background: #f8f9fa; padding: 1.5rem; border-left: 4px solid #007bff;">
          <ul>
            <li>✓ Virtual keyboard automatically appears when focusing numeric inputs</li>
            <li>✓ Three different keyboard layouts (0: Tall Simple, 1: Tall Full, 2: Short Full)</li>
            <li>✓ Support for decimal numbers (use the . button)</li>
            <li>✓ Support for negative numbers (use the - button in layouts 1 & 2)</li>
            <li>✓ Cursor positioning and text selection</li>
            <li>✓ Hardware keyboard integration (you can also type with physical keyboard)</li>
            <li>✓ Delete button for removing characters</li>
            <li>✓ Enter button to confirm and close keyboard</li>
            <li>✓ Click outside to close keyboard</li>
            <li>✓ Switch between different input fields without closing keyboard</li>
          </ul>
        </div>

        <hr>
        <h2>Current Values Summary</h2>
        <div style="background: #e9ecef; padding: 1.0rem; border-radius: 5px;">
          <pre style="margin: 0;">{{ JSON.stringify({
  number1: this.number1,
  number2: this.number2,
  number3: this.number3,
  number4: this.number4,
  layout: this.currentLayout
}, null, 2) }}</pre>
        </div>

        <hr>
        <div style="margin-top: 2.0rem; padding: 1.0rem; background: #fff3cd; border-left: 4px solid #ffc107;">
          <strong>Note:</strong> The virtual keyboard is enabled for all <code>input[type="number"]</code> elements.
          To use it in your application, call <code>NumericKeyboard.enable()</code> and optionally configure
          the layout with <code>NumericKeyboard.options.layout = 0|1|2</code>.
        </div>
      </div>
    `);
  }
}
