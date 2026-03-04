// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { SimpleTabs } from "../../components/SimpleTabs/SimpleTabs";

export class TestSimpleTabsPage extends HeaderPage {
  tabInstance: SimpleTabs;
  currentTab: string;
  tab1Content: string;
  tab2Visible: boolean;
  clickCount: number;

  constructor() {
    super();
    
    this.currentTab = "tab_1";
    this.tab1Content = "This is the input tab content!";
    this.tab2Visible = true;
    this.clickCount = 0;

    this.tabInstance = new SimpleTabs();
    
    // Override onTabChanged to track which tab is active
    if (this.tabInstance) {
      this.tabInstance.onTabChanged = (tabLabel) => {
        this.currentTab = tabLabel;
        console.log('Tab changed to:', tabLabel);
      };
    }
  }

  selectTab(tabId: string) {
    if (this.tabInstance) {
      this.tabInstance.select(tabId);
    }
  }

  toggleTab2Visibility() {
    this.tab2Visible = !this.tab2Visible;
    if (this.tabInstance) {
      this.tabInstance.setTabVisibility('tab_2', this.tab2Visible);
    }
  }

  incrementCounter() {
    this.clickCount++;
  }

  updateTab1Content() {
    this.tab1Content = `Updated at ${new Date().toLocaleTimeString()}`;
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="" style="padding: 2.0rem;">
        <h2>SimpleTabs Component Demo</h2>
        
        <p>Current active tab: <strong>{{ this.currentTab }}</strong></p>
        
        <div style="margin-bottom: 2.0rem;">
          <h3>Programmatic Tab Control</h3>
          <button onclick="this.selectTab('tab_1')" class="btn btn-primary">Select Tab 1</button>
          <button onclick="this.selectTab('tab_2')" class="btn btn-primary">Select Tab 2</button>
          <button onclick="this.selectTab('tab_3')" class="btn btn-primary">Select Tab 3</button>
          <button onclick="this.toggleTab2Visibility()" class="btn btn-secondary">
            {{ this.tab2Visible ? 'Hide' : 'Show' }} Tab 2
          </button>
        </div>

        <hr>

        <simple-tabs [component]="this.tabInstance">
          <ul>
            <li for="tab_1">{{Translate('input_tab')}}</li>
            <li for="tab_2">{{Translate('result_tab')}}</li>
            <li for="tab_3">Settings</li>
          </ul>
          <div>
            <div class="tab" id="tab_1">
              <div style="background: #f0f8ff; padding: 2.0rem; border-radius: 5px;">
                <h3>📝 Input Tab</h3>
                <p>{{ this.tab1Content }}</p>
                
                <div style="margin-top: 1.5rem;">
                  <label>Sample Input:</label>
                  <input type="text" [bind]="this.tab1Content" style="width: 100%; padding: 8px; margin-top: 5px;" />
                </div>
                
                <button onclick="this.updateTab1Content()" class="btn btn-primary" style="margin-top: 1.0rem;">
                  Update Content
                </button>
                
                <div style="margin-top: 2.0rem; padding: 1.0rem; background: white; border-radius: 3px;">
                  <strong>Features:</strong>
                  <ul>
                    <li>Data binding with [bind]</li>
                    <li>Dynamic content updates</li>
                    <li>Form elements within tabs</li>
                    <li>Translation support with {{Translate()}}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="tab" id="tab_2">
              <div style="background: #f0fff0; padding: 2.0rem; border-radius: 5px;">
                <h3>✅ Result Tab</h3>
                <p>This tab displays results and outputs.</p>
                
                <div style="margin-top: 1.5rem; padding: 1.5rem; background: white; border-radius: 3px; border: 1px solid #ddd;">
                  <p><strong>Input Content:</strong> {{ this.tab1Content }}</p>
                  <p><strong>Click Count:</strong> {{ this.clickCount }}</p>
                  <p><strong>Tab Visibility:</strong> {{ this.tab2Visible ? 'Visible' : 'Hidden' }}</p>
                </div>
                
                <button onclick="this.incrementCounter()" class="btn btn-success" style="margin-top: 1.0rem;">
                  Increment Counter ({{ this.clickCount }})
                </button>
                
                <div style="margin-top: 2.0rem; padding: 1.0rem; background: #ffffed; border-radius: 3px;">
                  <strong>💡 Try this:</strong>
                  <ul>
                    <li>Switch to Tab 1 and change the input</li>
                    <li>Come back here to see the updated value</li>
                    <li>Use the buttons above to control tabs programmatically</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="tab" id="tab_3">
              <div style="background: #fff5f5; padding: 2.0rem; border-radius: 5px;">
                <h3>⚙️ Settings Tab</h3>
                <p>Additional content to demonstrate multiple tabs.</p>
                
                <div style="margin-top: 1.5rem;">
                  <h4>SimpleTabs API Methods:</h4>
                  <div style="background: white; padding: 1.5rem; border-radius: 3px; font-family: monospace; margin-top: 1.0rem;">
                    <p><code>select(forLabel)</code> - Programmatically select a tab</p>
                    <p><code>setTabVisibility(forLabel, isVisible)</code> - Show/hide tabs</p>
                    <p><code>onTabChanged(tabLabel)</code> - Callback when tab changes</p>
                  </div>
                </div>
                
                <div style="margin-top: 2.0rem; padding: 1.5rem; background: #e8f4f8; border-radius: 3px;">
                  <h4>Component Features:</h4>
                  <ul>
                    <li>✓ Click-based tab switching</li>
                    <li>✓ Selected state management</li>
                    <li>✓ Dynamic tab visibility control</li>
                    <li>✓ Event callbacks on tab change</li>
                    <li>✓ Programmatic tab selection</li>
                    <li>✓ CSS styling with selected attribute</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </simple-tabs>

        <hr style="margin-top: 3.0rem;">

        <div style="padding: 1.5rem; background: #f9f9f9; border-radius: 5px;">
          <h3>📘 Usage Example</h3>
          <pre style="background: white; padding: 1.5rem; border-radius: 3px; overflow-x: auto;"><code>RegisterComponent(SimpleTabs, 'simple-tabs');
....
&lt;simple-tabs&gt;
  &lt;ul&gt;
    &lt;li for="tab_1"&gt;{{Translate('input_tab')}}&lt;/li&gt;
    &lt;li for="tab_2"&gt;{{Translate('result_tab')}}&lt;/li&gt;
  &lt;/ul&gt;
  &lt;div&gt;
    &lt;div class="tab" id="tab_1"&gt;
      Tab 1 content here
    &lt;/div&gt;
    &lt;div class="tab" id="tab_2"&gt;
      Tab 2 content here
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/simple-tabs&gt;</code>
OR
<code>this.myTabs = new SimpleTabs();
....
&lt;div [component]="'myTabs' class="simple-tabs"&gt;
  &lt;ul&gt;
    &lt;li for="tab_1"&gt;{{Translate('input_tab')}}&lt;/li&gt;
    &lt;li for="tab_2"&gt;{{Translate('result_tab')}}&lt;/li&gt;
  &lt;/ul&gt;
  &lt;div&gt;
    &lt;div class="tab" id="tab_1"&gt;
      Tab 1 content here
    &lt;/div&gt;
    &lt;div class="tab" id="tab_2"&gt;
      Tab 2 content here
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
        </div>

      </div>
    `);
  }
}
