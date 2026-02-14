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
  
  // Conditional HTML rendering properties
  showConditionalHtml: boolean;
  viewMode: string;
  userRole: string;
  statusType: string;
  enableNestedCondition: boolean;

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
    
    // Initialize conditional rendering properties
    this.showConditionalHtml = true;
    this.viewMode = 'card';
    this.userRole = 'user';
    this.statusType = 'success';
    this.enableNestedCondition = true;
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

  // Conditional HTML rendering methods
  toggleConditionalHtml() {
    this.showConditionalHtml = !this.showConditionalHtml;
  }

  setViewMode(mode: string) {
    this.viewMode = mode;
  }

  setUserRole(role: string) {
    this.userRole = role;
  }

  setStatusType(status: string) {
    this.statusType = status;
  }

  toggleNestedCondition() {
    this.enableNestedCondition = !this.enableNestedCondition;
  }

  get conditionalHtml(): string {
    if (!this.showConditionalHtml) {
      return '';
    }
    return `
      <div style="padding: 15px; background: lightgreen; border-radius: 5px; border: 2px solid green;">
        <h4>✓ Conditional HTML is Active</h4>
        <p>This HTML is only rendered when <code>showConditionalHtml</code> is true.</p>
        <p><strong>Counter value:</strong> ${this.counter}</p>
        <p><strong>User:</strong> ${this.userName}</p>
      </div>
    `;
  }

  get viewModeHtml(): string {
    switch (this.viewMode) {
      case 'card':
        return `
          <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 24px; font-weight: bold; color: #007bff; margin-bottom: 10px;">📇 Card View</div>
            <p style="color: #666;">This is a card-style layout with shadows and borders.</p>
            <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
              <strong>Counter:</strong> ${this.counter} | <strong>User:</strong> ${this.userName}
            </div>
          </div>
        `;
      case 'list':
        return `
          <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 15px;">
            <div style="font-size: 20px; font-weight: bold; color: #28a745; margin-bottom: 8px;">📋 List View</div>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li>Counter: ${this.counter}</li>
              <li>User: ${this.userName}</li>
              <li>Items: ${this.items.length}</li>
              <li>Date: ${this.formattedDate}</li>
            </ul>
          </div>
        `;
      case 'compact':
        return `
          <div style="display: inline-block; padding: 8px 12px; background: #6c757d; color: white; border-radius: 4px; font-size: 14px;">
            <strong>🔹 Compact:</strong> ${this.userName} | Count: ${this.counter}
          </div>
        `;
      default:
        return `<div style="padding: 10px; background: #ffc107; color: #333;">Unknown view mode: ${this.viewMode}</div>`;
    }
  }

  get userRoleHtml(): string {
    switch (this.userRole) {
      case 'admin':
        return `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
            <div style="font-size: 28px; margin-bottom: 10px;">👑 Administrator Panel</div>
            <p style="font-size: 16px;">You have full access to all system features.</p>
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 4px;">
              <strong>Permissions:</strong> Read, Write, Delete, Manage Users
            </div>
            <button style="margin-top: 10px; padding: 8px 16px; background: white; color: #667eea; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
              Manage System
            </button>
          </div>
        `;
      case 'moderator':
        return `
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px;">
            <div style="font-size: 24px; margin-bottom: 10px;">🛡️ Moderator Dashboard</div>
            <p>You can moderate content and manage users.</p>
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 4px;">
              <strong>Permissions:</strong> Read, Write, Moderate Content
            </div>
          </div>
        `;
      case 'user':
        return `
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 8px;">
            <div style="font-size: 22px; margin-bottom: 10px;">👤 User Dashboard</div>
            <p>Welcome! You have standard user access.</p>
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 4px;">
              <strong>Permissions:</strong> Read, Write (own content)
            </div>
          </div>
        `;
      default:
        return `<div style="padding: 15px; background: #e9ecef; border-radius: 4px; color: #666;">Guest Access - Limited permissions</div>`;
    }
  }

  get statusHtml(): string {
    const statusConfig = {
      success: {
        icon: '✓',
        color: '#28a745',
        bg: '#d4edda',
        border: '#c3e6cb',
        title: 'Success',
        message: 'Operation completed successfully!'
      },
      warning: {
        icon: '⚠',
        color: '#ffc107',
        bg: '#fff3cd',
        border: '#ffeaa7',
        title: 'Warning',
        message: 'Please review the following information.'
      },
      error: {
        icon: '✗',
        color: '#dc3545',
        bg: '#f8d7da',
        border: '#f5c6cb',
        title: 'Error',
        message: 'An error occurred. Please try again.'
      },
      info: {
        icon: 'ℹ',
        color: '#17a2b8',
        bg: '#d1ecf1',
        border: '#bee5eb',
        title: 'Information',
        message: 'Here is some helpful information.'
      }
    };

    const config = statusConfig[this.statusType] || statusConfig.info;

    return `
      <div style="background: ${config.bg}; border: 2px solid ${config.border}; border-left: 5px solid ${config.color}; padding: 15px; border-radius: 4px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 24px; color: ${config.color}; margin-right: 10px;">${config.icon}</span>
          <strong style="font-size: 18px; color: ${config.color};">${config.title}</strong>
        </div>
        <p style="margin: 0; color: #333;">${config.message}</p>
        <div style="margin-top: 10px; font-size: 12px; color: #666;">
          Counter: ${this.counter} | User: ${this.userName} | Time: ${new Date().toLocaleTimeString()}
        </div>
      </div>
    `;
  }

  get nestedConditionalHtml(): string {
    if (!this.enableNestedCondition) {
      return '<div style="padding: 10px; background: #e9ecef; color: #666;">Nested condition is disabled</div>';
    }

    return `
      <div style="border: 2px solid #007bff; padding: 15px; border-radius: 8px; background: #e7f3ff;">
        <h4 style="color: #007bff; margin-top: 0;">Nested Conditional Content</h4>
        <p>This content is visible because <code>enableNestedCondition</code> is true.</p>
        ${this.counter > 5 ? `
          <div style="margin-top: 10px; padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px;">
            <strong style="color: #28a745;">✓ Counter is greater than 5!</strong>
            <p style="margin: 5px 0 0 0; color: #155724;">Current value: ${this.counter}</p>
          </div>
        ` : `
          <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
            <strong style="color: #856404;">Counter is 5 or less</strong>
            <p style="margin: 5px 0 0 0; color: #856404;">Current value: ${this.counter}</p>
          </div>
        `}
      </div>
    `;
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

        <hr style="margin: 40px 0; border: none; border-top: 3px solid #007bff;">

        <h1 style="color: #007bff; margin-bottom: 30px;">🎯 Conditional HTML Rendering Demonstrations</h1>

        <h2>1. Basic Conditional HTML with Getter</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Toggle visibility of dynamically generated HTML using a boolean condition</strong></p>
          
          <button onclick="this.toggleConditionalHtml()" class="btn btn-primary">
            Toggle Conditional HTML (Currently: {{ this.showConditionalHtml ? 'ON' : 'OFF' }})
          </button>
          
          <div style="margin-top: 15px; min-height: 60px; padding: 10px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 4px;">
            <div [html]="this.conditionalHtml"></div>
            <div [if]="!this.showConditionalHtml" style="color: #999; text-align: center; padding: 20px;">
              <em>Conditional HTML is hidden - click the button to show it</em>
            </div>
          </div>

          <div style="margin-top: 10px; padding: 10px; background: #e7f3ff; border-left: 4px solid #007bff;">
            <strong>💡 How it works:</strong> The <code>conditionalHtml</code> getter returns different HTML based on <code>showConditionalHtml</code>.
            When false, it returns an empty string, effectively hiding the content.
          </div>
        </div>

        <hr>

        <h2>2. Conditional HTML Selection - View Modes</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Switch between different HTML templates based on the selected view mode</strong></p>
          
          <div style="margin-bottom: 15px;">
            <button onclick="this.setViewMode('card')" class="btn btn-primary" style="margin-right: 5px;">Card View</button>
            <button onclick="this.setViewMode('list')" class="btn btn-primary" style="margin-right: 5px;">List View</button>
            <button onclick="this.setViewMode('compact')" class="btn btn-primary">Compact View</button>
          </div>

          <div style="padding: 10px; background: #f8f9fa; border: 1px solid #ddd; margin-bottom: 10px;">
            <strong>Current View Mode:</strong> <code>{{ this.viewMode }}</code>
          </div>

          <div [html]="this.viewModeHtml" style="margin-top: 15px;"></div>

          <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107;">
            <strong>💡 Pattern:</strong> The <code>viewModeHtml</code> getter uses a switch statement to return completely different
            HTML structures based on the current state. This is useful for A/B testing, responsive layouts, or user preferences.
          </div>
        </div>

        <hr>

        <h2>3. Role-Based Conditional HTML</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Display different dashboards based on user role</strong></p>
          
          <div style="margin-bottom: 15px;">
            <button onclick="this.setUserRole('admin')" class="btn btn-primary" style="margin-right: 5px;">Admin</button>
            <button onclick="this.setUserRole('moderator')" class="btn btn-primary" style="margin-right: 5px;">Moderator</button>
            <button onclick="this.setUserRole('user')" class="btn btn-primary" style="margin-right: 5px;">User</button>
            <button onclick="this.setUserRole('guest')" class="btn btn-secondary">Guest</button>
          </div>

          <div style="padding: 10px; background: #f8f9fa; border: 1px solid #ddd; margin-bottom: 10px;">
            <strong>Current Role:</strong> <code>{{ this.userRole }}</code>
          </div>

          <div [html]="this.userRoleHtml" style="margin-top: 15px;"></div>

          <div style="margin-top: 15px; padding: 10px; background: #d1ecf1; border-left: 4px solid #17a2b8;">
            <strong>💡 Use Case:</strong> This pattern is perfect for permission-based UI where different user roles see
            completely different interfaces. Each role gets a customized dashboard with appropriate styling and content.
          </div>
        </div>

        <hr>

        <h2>4. Status-Based Conditional HTML</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Display different alert styles based on status type</strong></p>
          
          <div style="margin-bottom: 15px;">
            <button onclick="this.setStatusType('success')" class="btn btn-success" style="margin-right: 5px;">Success</button>
            <button onclick="this.setStatusType('warning')" class="btn btn-warning" style="margin-right: 5px;">Warning</button>
            <button onclick="this.setStatusType('error')" class="btn btn-danger" style="margin-right: 5px;">Error</button>
            <button onclick="this.setStatusType('info')" class="btn btn-info">Info</button>
          </div>

          <div style="padding: 10px; background: #f8f9fa; border: 1px solid #ddd; margin-bottom: 10px;">
            <strong>Current Status:</strong> <code>{{ this.statusType }}</code>
          </div>

          <div [html]="this.statusHtml" style="margin-top: 15px;"></div>

          <div style="margin-top: 15px; padding: 10px; background: #d4edda; border-left: 4px solid #28a745;">
            <strong>💡 Best Practice:</strong> Using a configuration object to manage different states makes it easy to maintain
            and extend. The HTML template dynamically incorporates the current application state (counter, userName, time).
          </div>
        </div>

        <hr>

        <h2>5. Nested Conditional HTML Logic</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Combine multiple conditions within generated HTML</strong></p>
          
          <div style="margin-bottom: 15px;">
            <button onclick="this.toggleNestedCondition()" class="btn btn-primary" style="margin-right: 10px;">
              Toggle Outer Condition ({{ this.enableNestedCondition ? 'Enabled' : 'Disabled' }})
            </button>
            <button onclick="this.incrementCounter()" class="btn btn-secondary">
              Increment Counter ({{ this.counter }})
            </button>
          </div>

          <div style="padding: 10px; background: #f8f9fa; border: 1px solid #ddd; margin-bottom: 10px;">
            <strong>Outer Condition:</strong> <code>{{ this.enableNestedCondition }}</code> | 
            <strong>Counter:</strong> <code>{{ this.counter }}</code> |
            <strong>Inner Condition (counter > 5):</strong> <code>{{ this.counter > 5 }}</code>
          </div>

          <div [html]="this.nestedConditionalHtml" style="margin-top: 15px;"></div>

          <div style="margin-top: 15px; padding: 10px; background: #f8d7da; border-left: 4px solid #dc3545;">
            <strong>⚠️ Important:</strong> The HTML is generated in JavaScript, so inner conditions are evaluated during HTML generation.
            This is different from using <code>[if]</code> directives in the template, which are evaluated during rendering.
            Both approaches have their use cases!
          </div>
        </div>

        <hr>

        <h2>6. Combining [if] Directive with [html]</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Use [if] directive to control when HTML is rendered, and [html] for the content</strong></p>
          
          <div style="padding: 10px; background: #e7f3ff; margin-bottom: 15px; border-radius: 4px;">
            <strong>Current State:</strong> Counter = {{ this.counter }}, ShowConditional = {{ this.showConditionalHtml }}
          </div>

          <div [if]="this.counter > 3" style="margin-bottom: 15px;">
            <div style="padding: 15px; background: #d4edda; border: 2px solid #28a745; border-radius: 4px;">
              <h4 style="color: #155724; margin-top: 0;">✓ [if] Directive: Counter > 3</h4>
              <p style="margin: 0;">This content is controlled by the <code>[if]</code> directive (removes/adds to DOM)</p>
            </div>
          </div>

          <div [if]="this.showConditionalHtml">
            <div [html]="this.statusHtml" style="margin-bottom: 15px;"></div>
          </div>

          <div [if]="!this.showConditionalHtml">
            <div style="padding: 15px; background: #f8d7da; border: 2px solid #dc3545; border-radius: 4px;">
              <h4 style="color: #721c24; margin-top: 0;">✗ HTML Rendering Disabled</h4>
              <p style="margin: 0;">The <code>showConditionalHtml</code> flag is false</p>
            </div>
          </div>

          <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107;">
            <strong>💡 Key Difference:</strong><br>
            • <code>[if]</code> removes/adds elements from the DOM (better performance for hidden content)<br>
            • <code>[html]</code> with conditional logic can return empty string (keeps element in DOM)<br>
            • Combining both gives you maximum control over rendering behavior
          </div>
        </div>

        <hr>

        <h2>7. Dynamic HTML with Live Data Binding</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Generated HTML automatically updates when data changes</strong></p>
          
          <div style="margin-bottom: 15px;">
            <button onclick="this.incrementCounter()" class="btn btn-primary" style="margin-right: 5px;">Increment Counter</button>
            <button onclick="this.updateHtmlContent()" class="btn btn-secondary">Update HTML Content</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div>
              <h4 style="margin-top: 0;">View Mode HTML (Live Updates)</h4>
              <div [html]="this.viewModeHtml"></div>
            </div>
            <div>
              <h4 style="margin-top: 0;">Status HTML (Live Updates)</h4>
              <div [html]="this.statusHtml"></div>
            </div>
          </div>

          <div style="margin-top: 15px; padding: 10px; background: #e7f3ff; border-left: 4px solid #007bff;">
            <strong>🔄 Reactivity:</strong> Notice how both panels update automatically when you increment the counter.
            The framework detects changes and re-evaluates the getter functions, regenerating the HTML with fresh data.
            This demonstrates the power of reactive data binding combined with conditional HTML rendering.
          </div>
        </div>

        <hr>

        <h2>8. [if] and [html] on Same Element</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Both directives applied to the same element - [if] controls element existence, [html] controls its content</strong></p>
          
          <div style="margin-bottom: 15px;">
            <button onclick="this.toggleConditionalHtml()" class="btn btn-primary" style="margin-right: 10px;">
              Toggle If Condition ({{ this.showConditionalHtml ? 'Show' : 'Hide' }})
            </button>
            <button onclick="this.setStatusType('success')" class="btn btn-success" style="margin-right: 5px;">Success</button>
            <button onclick="this.setStatusType('warning')" class="btn btn-warning" style="margin-right: 5px;">Warning</button>
            <button onclick="this.setStatusType('error')" class="btn btn-danger">Error</button>
          </div>

          <div style="padding: 10px; background: #f8f9fa; border: 1px solid #ddd; margin-bottom: 10px;">
            <strong>If Condition:</strong> <code>{{ this.showConditionalHtml }}</code> | 
            <strong>Status Type:</strong> <code>{{ this.statusType }}</code>
          </div>

          <div style="border: 2px dashed #007bff; padding: 15px; min-height: 100px; background: #f8f9fa;">
            <div [if]="this.showConditionalHtml" [html]="this.statusHtml" style="margin: 0;"></div>
            
            <div [if]="!this.showConditionalHtml" style="text-align: center; padding: 20px; color: #999;">
              <em>Element removed from DOM by [if] directive</em>
            </div>
          </div>

          <div style="margin-top: 15px; padding: 10px; background: #e7f3ff; border-left: 4px solid #007bff;">
            <strong>💡 How it works:</strong><br>
            • The <code>[if]</code> directive controls whether the element exists in the DOM at all<br>
            • The <code>[html]</code> directive dynamically sets the innerHTML when the element is rendered<br>
            • When <code>[if]</code> is false, the element is removed entirely (not just hidden)<br>
            • When <code>[if]</code> becomes true, the element is created and <code>[html]</code> populates its content<br>
            • Both directives re-evaluate on data changes, providing fully reactive behavior
          </div>

          <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107;">
            <strong>⚡ Use Case:</strong> Perfect for conditional widgets or panels where you want to:
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Completely remove unused elements from DOM (performance)</li>
              <li>Dynamically generate content based on application state</li>
              <li>Combine existence checks with content generation</li>
            </ul>
          </div>
        </div>

        <hr style="margin: 40px 0;">

        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">📚 Summary: Conditional HTML Rendering Patterns</h3>
          <ol style="line-height: 1.8;">
            <li><strong>Boolean Toggle:</strong> Use getter to return HTML or empty string based on boolean</li>
            <li><strong>State Selection:</strong> Switch statements to render different HTML per state</li>
            <li><strong>Role-Based:</strong> Display different interfaces based on user permissions</li>
            <li><strong>Status-Based:</strong> Configuration objects for managing multiple UI states</li>
            <li><strong>Nested Logic:</strong> Embed conditions within JavaScript template literals</li>
            <li><strong>Combined Directives:</strong> Use [if] with [html] for maximum control</li>
            <li><strong>Reactive Updates:</strong> HTML regenerates automatically on data changes</li>
            <li><strong>Same Element:</strong> Apply both [if] and [html] to one element for existence + content control</li>
          </ol>
        </div>

      </div>
    `);
  }
}