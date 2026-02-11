// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";

export class TestHtmlContentPage extends HeaderPage {
  htmlContent: string;
  safeHtml: string;
  unsafeHtml: string;
  markdownContent: string;
  dynamicHtml: string;
  expressionResult: string;
  counter: number;
  userName: string;
  items: string[];

  constructor() {
    super();
    
    this.htmlContent = '<strong>Bold Text</strong> and <em>Italic Text</em>';
    this.safeHtml = '<div style="padding: 10px; background: lightgreen;"><h3>Safe HTML Content</h3><p>This is safe to render.</p></div>';
    this.unsafeHtml = '<script>alert("XSS")</script><div>Normal content</div>';
    this.markdownContent = '<h3>Markdown-style Content</h3><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
    this.dynamicHtml = '<div class="alert">Dynamic content loaded!</div>';
    this.expressionResult = 'Calculated value';
    this.counter = 0;
    this.userName = 'John Doe';
    this.items = ['Apple', 'Banana', 'Cherry'];
  }

  updateHtmlContent() {
    const colors = ['lightblue', 'lightgreen', 'lightcoral', 'lightyellow', 'lightpink'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.htmlContent = `<div style="padding: 15px; background: ${color}; border-radius: 5px;">
      <h4>Updated at ${new Date().toLocaleTimeString()}</h4>
      <p>Random color: ${color}</p>
    </div>`;
  }

  loadComplexHtml() {
    this.dynamicHtml = `
      <div style="border: 2px solid #007bff; padding: 20px; border-radius: 8px;">
        <h3>Complex HTML Structure</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #007bff; color: white;">
              <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Counter</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${this.counter}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">User</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${this.userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Timestamp</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  generateList() {
    const listHtml = this.items.map((item, index) => 
      `<li style="padding: 5px; border-bottom: 1px solid #ddd;">${index + 1}. ${item}</li>`
    ).join('');
    
    this.markdownContent = `
      <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">
        <h3>Generated List</h3>
        <ul style="list-style: none; padding: 0;">
          ${listHtml}
        </ul>
      </div>
    `;
  }

  clearHtml() {
    this.htmlContent = '';
    this.dynamicHtml = '';
  }

  incrementCounter() {
    this.counter++;
  }

  get calculatedValue(): number {
    return this.counter * 2 + 10;
  }

  get formattedDate(): string {
    return new Date().toLocaleDateString();
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="fill scroll" style="padding: 20px;">
        <h2>[html] Directive Tests</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Dynamic HTML Rendering:</strong></p>
          <button onclick="this.updateHtmlContent()" class="btn btn-primary">Update HTML</button>
          <button onclick="this.clearHtml()" class="btn btn-danger">Clear</button>
          
          <div [html]="this.htmlContent" style="margin-top: 10px; border: 1px solid #ddd; padding: 10px; min-height: 50px;">
          </div>

          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Raw HTML String:</strong>
            <pre style="margin: 5px 0; font-size: 12px; white-space: pre-wrap;">{{ this.htmlContent }}</pre>
          </div>
        </div>

        <hr>

        <h2>[innerhtml] Directive Tests</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>innerHTML vs [html]:</strong></p>
          <p><em>Note: Both [html] and [innerhtml] directives set the innerHTML of elements</em></p>
          
          <button onclick="this.loadComplexHtml()" class="btn btn-primary">Load Complex HTML</button>
          <button onclick="this.generateList()" class="btn btn-secondary">Generate List</button>
          
          <div [innerhtml]="this.dynamicHtml" style="margin-top: 10px;">
          </div>
        </div>

        <hr>

        <h2>Template Expressions {{ }}</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Simple Expressions:</strong></p>
          
          <button onclick="this.incrementCounter()" class="btn btn-primary">Increment Counter</button>
          
          <div style="margin-top: 10px; padding: 15px; background: #f8f9fa; border: 1px solid #ddd;">
            <p><strong>Counter Value:</strong> {{ this.counter }}</p>
            <p><strong>Counter * 2:</strong> {{ this.counter * 2 }}</p>
            <p><strong>Counter + 100:</strong> {{ this.counter + 100 }}</p>
            <p><strong>Is Even:</strong> {{ this.counter % 2 === 0 ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <hr>

        <h2>Complex Expressions</h2>
        
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: #e9ecef; border-radius: 5px;">
            <h4>User Information</h4>
            <p><strong>Name:</strong> {{ this.userName }}</p>
            <p><strong>Name Length:</strong> {{ this.userName.length }} characters</p>
            <p><strong>Uppercase:</strong> {{ this.userName.toUpperCase() }}</p>
            <p><strong>First Name:</strong> {{ this.userName.split(' ')[0] }}</p>
          </div>
        </div>

        <hr>

        <h2>Method Call Expressions</h2>
        
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: #fff3cd; border: 1px solid #ffc107;">
            <p><strong>Calculated Value (method):</strong> {{ this.calculatedValue }}</p>
            <p><strong>Formatted Date (getter):</strong> {{ this.formattedDate }}</p>
            <p><strong>Array Length:</strong> {{ this.items.length }}</p>
            <p><strong>First Item:</strong> {{ this.items[0] }}</p>
            <p><strong>Last Item:</strong> {{ this.items[this.items.length - 1] }}</p>
          </div>
        </div>

        <hr>

        <h2>Conditional Expressions</h2>
        
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: lightblue; border-radius: 5px;">
            <p><strong>Counter Status:</strong> {{ this.counter === 0 ? 'Zero' : this.counter > 0 ? 'Positive' : 'Negative' }}</p>
            <p><strong>Counter Range:</strong> {{ this.counter < 5 ? 'Low' : this.counter < 10 ? 'Medium' : 'High' }}</p>
            <p><strong>Boolean Display:</strong> {{ this.counter > 5 && this.counter < 15 ? '✓ In range' : '✗ Out of range' }}</p>
          </div>
        </div>

        <hr>

        <h2>HTML with Template Expressions</h2>
        
        <div style="margin-bottom: 20px;">
          <div [html]="this.markdownContent">
          </div>
          
          <div style="margin-top: 10px; padding: 10px; background: #f0f0f0;">
            <strong>Items Array:</strong> {{ JSON.stringify(this.items) }}
          </div>
        </div>

        <hr>

        <h2>Safe vs Unsafe HTML</h2>
        
        <div style="margin-bottom: 20px;">
          <div style="border: 2px solid green; padding: 15px; margin-bottom: 10px;">
            <h4 style="color: green;">✓ Safe HTML (should render):</h4>
            <div [html]="this.safeHtml"></div>
          </div>

          <div style="border: 2px solid red; padding: 15px;">
            <h4 style="color: red;">⚠ Potentially Unsafe HTML:</h4>
            <div [html]="this.unsafeHtml"></div>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
              Note: Scripts should not execute due to innerHTML security restrictions
            </p>
          </div>
        </div>

        <hr>

        <h2>Expression Edge Cases</h2>
        
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: #f8f9fa;">
            <p><strong>Undefined value:</strong> "{{ this.nonExistentProperty }}"</p>
            <p><strong>Null coalescing:</strong> {{ this.nonExistentProperty || 'default value' }}</p>
            <p><strong>String concatenation:</strong> {{ 'Counter is: ' + this.counter }}</p>
            <p><strong>Template literal:</strong> The counter value is {{ this.counter }} right now</p>
            <p><strong>Nested property:</strong> {{ this.items && this.items[0] ? this.items[0].length : 0 }} chars in first item</p>
          </div>
        </div>

        <hr>

        <h2>JSON Display</h2>
        
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: #282c34; color: #abb2bf; border-radius: 5px;">
            <pre style="margin: 0; font-family: 'Courier New', monospace; font-size: 12px;">{{ JSON.stringify({
  counter: this.counter,
  userName: this.userName,
  items: this.items,
  calculatedValue: this.calculatedValue
}, null, 2) }}</pre>
          </div>
        </div>

      </div>
    `);
  }
}