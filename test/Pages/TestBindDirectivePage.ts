// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";

export class TestBindDirectivePage extends HeaderPage {
  textInput: string;
  textareaInput: string;
  selectValue: string;
  radioValue: string;
  checkboxValue: boolean;
  numberInput: number;
  emailInput: string;
  dateInput: string;
  multiSelectValues: string[];

  constructor() {
    super();
    
    this.textInput = "Hello World";
    this.textareaInput = "Multi-line\ntext content\nhere";
    this.selectValue = "option2";
    this.radioValue = "radio2";
    this.checkboxValue = true;
    this.numberInput = 42;
    this.emailInput = "test@example.com";
    this.dateInput = "2024-01-15";
    this.multiSelectValues = ["opt2", "opt3"];
  }

  resetAll() {
    this.textInput = "";
    this.textareaInput = "";
    this.selectValue = "";
    this.radioValue = "";
    this.checkboxValue = false;
    this.numberInput = 0;
    this.emailInput = "";
    this.dateInput = "";
  }

  setDefaults() {
    this.textInput = "Default Text";
    this.textareaInput = "Default\nMulti-line\nContent";
    this.selectValue = "option1";
    this.radioValue = "radio1";
    this.checkboxValue = true;
    this.numberInput = 100;
    this.emailInput = "default@test.com";
    this.dateInput = "2024-12-31";
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="fill scroll" style="padding: 20px;">
        <div style="margin-bottom: 20px;">
          <button onclick="this.resetAll()" class="btn btn-danger">Reset All</button>
          <button onclick="this.setDefaults()" class="btn btn-primary">Set Defaults</button>
        </div>

        <hr>

        <h2>[bind] Text Input</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px;">
            <strong>Text Input:</strong>
          </label>
          <input type="text" bind="this.textInput" style="width: 100%; padding: 8px; font-size: 14px;" />
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Bound Value:</strong> "{{ this.textInput }}"
            <br>
            <strong>Length:</strong> {{ this.textInput ? this.textInput.length : 0 }}
          </div>
        </div>

        <hr>

        <h2>[bind] Textarea</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px;">
            <strong>Textarea:</strong>
          </label>
          <textarea [bind]="this.textareaInput" rows="4" style="width: 100%; padding: 8px; font-size: 14px;"></textarea>
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0; white-space: pre-wrap;">
            <strong>Bound Value:</strong>
            <pre style="margin: 5px 0;">{{ this.textareaInput }}</pre>
          </div>
        </div>

        <hr>

        <h2>[bind] Select Dropdown</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px;">
            <strong>Select:</strong>
          </label>
          <select [bind]="this.selectValue" style="width: 100%; padding: 8px; font-size: 14px;">
            <option value="">-- Select an option --</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
            <option value="option4">Option 4</option>
          </select>
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Selected Value:</strong> "{{ this.selectValue }}"
          </div>
        </div>

        <hr>

        <h2>[bind] Radio Buttons</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px;">
            <strong>Radio Group:</strong>
          </label>
          
          <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px;">
              <input type="radio" name="radioGroup" value="radio1" [bind]="this.radioValue" />
              Radio Option 1
            </label>
            <label style="display: block; margin-bottom: 5px;">
              <input type="radio" name="radioGroup" value="radio2" [bind]="this.radioValue" />
              Radio Option 2
            </label>
            <label style="display: block; margin-bottom: 5px;">
              <input type="radio" name="radioGroup" value="radio3" [bind]="this.radioValue" />
              Radio Option 3
            </label>
          </div>
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Selected Radio:</strong> "{{ this.radioValue }}"
          </div>
        </div>

        <hr>

        <h2>[bind] Checkbox</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 10px;">
            <input type="checkbox" [bind]="this.checkboxValue" />
            <strong>Checkbox Option</strong>
          </label>
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Checked:</strong> {{ this.checkboxValue ? '✓ Yes' : '✗ No' }}
            <br>
            <strong>Boolean Value:</strong> {{ this.checkboxValue }}
          </div>
        </div>

        <hr>

        <h2>[bind] Number Input</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px;">
            <strong>Number Input:</strong>
          </label>
          <input type="number" [bind]="this.numberInput" style="width: 100%; padding: 8px; font-size: 14px;" />
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Bound Value:</strong> {{ this.numberInput }}
            <br>
            <strong>Type:</strong> {{ typeof this.numberInput }}
            <br>
            <strong>Doubled:</strong> {{ this.numberInput * 2 }}
          </div>
        </div>

        <hr>

        <h2>[bind] Email Input</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px;">
            <strong>Email Input:</strong>
          </label>
          <input type="email" [bind]="this.emailInput" style="width: 100%; padding: 8px; font-size: 14px;" 
                 placeholder="email@example.com" />
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Bound Value:</strong> "{{ this.emailInput }}"
            <br>
            <strong>Valid Format:</strong> {{ this.emailInput && this.emailInput.includes('@') ? '✓' : '✗' }}
          </div>
        </div>

        <hr>

        <h2>[bind] Date Input</h2>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px;">
            <strong>Date Input:</strong>
          </label>
          <input type="date" [bind]="this.dateInput" style="width: 100%; padding: 8px; font-size: 14px;" />
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Bound Value:</strong> "{{ this.dateInput }}"
          </div>
        </div>

        <hr>

        <h2>Combined Form Example</h2>
        <div style="margin-bottom: 20px;">
          <div style="border: 2px solid #007bff; padding: 15px; border-radius: 5px;">
            <h3>User Profile Form</h3>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Name:</label>
              <input type="text" [bind]="this.textInput" style="width: 100%; padding: 8px;" />
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Email:</label>
              <input type="email" [bind]="this.emailInput" style="width: 100%; padding: 8px;" />
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Age:</label>
              <input type="number" [bind]="this.numberInput" style="width: 100%; padding: 8px;" />
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px;">Country:</label>
              <select [bind]="this.selectValue" style="width: 100%; padding: 8px;">
                <option value="">Select...</option>
                <option value="option1">USA</option>
                <option value="option2">Canada</option>
                <option value="option3">UK</option>
                <option value="option4">Other</option>
              </select>
            </div>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block;">
                <input type="checkbox" [bind]="this.checkboxValue" />
                I agree to terms and conditions
              </label>
            </div>

            <div style="margin-top: 15px; padding: 15px; background: #e9ecef; border-radius: 5px;">
              <h4>Form Summary:</h4>
              <p><strong>Name:</strong> {{ this.textInput }}</p>
              <p><strong>Email:</strong> {{ this.emailInput }}</p>
              <p><strong>Age:</strong> {{ this.numberInput }}</p>
              <p><strong>Country:</strong> {{ this.selectValue }}</p>
              <p><strong>Agreed to terms:</strong> {{ this.checkboxValue ? 'Yes' : 'No' }}</p>
            </div>
          </div>
        </div>

      </div>
    `);
  }
}