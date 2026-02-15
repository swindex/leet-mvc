// @ts-nocheck
/**
 * Template Parser - DOM Validity Tests
 * 
 * This test suite verifies that HTML templates are correctly parsed into valid DOM.
 * 
 * BUGS DISCOVERED:
 * ================
 * 1. Stacked [if] directives are NOT rendering content properly
 *    - Only the comment anchor is rendered: <!--[if]=showLevel1 -->
 *    - The actual DIV content is not being created/inserted into the DOM
 *    - This affects nested [if] directives at all levels
 * 
 * 2. Possible issue in IfDirective.ts:
 *    - There's a debug line modifying textContent: 
 *      `on.elem!.textContent = on.elem?.textContent + ", "+ isTrue;`
 *    - This may be preventing proper rendering
 * 
 * To expand this test suite, consider adding tests for:
 * - Templates with data binding: <div>{{someValue}}</div>
 * - Templates with directives: <div [if]="condition">Content</div>
 * - Templates with event handlers: <button (click)="handleClick()">Click</button>
 * - Templates with nested elements
 * - Templates with attributes and classes
 * - Templates with multiple root elements (should wrap in fragment)
 * - Templates with invalid/malformed HTML
 * - Templates with special characters and escaping
 */
import './../../index';

import { Binder } from "../../core/binder/Binder";
import { TemplateParser } from "../../core/binder/TemplateParser";
import { DOM } from '../../core/DOM';
import { BaseComponent } from '../../components/BaseComponent';

describe('Template Parser - DOM Validity Test', function() {

  beforeEach(function(done){
    document.body.innerHTML = '';
    done();
  })

  afterEach(function(done){
    document.body.innerHTML = '';
    done();
  })

  it("Simple template is parsed to valid DOM", function() {
    // Arrange: Create a simple HTML template
    const template = '<div class="test-container">Hello World</div>';
    
    // Create context and binder
    const context = {};
    const binder = new Binder(context);
    // Act: Parse and bind the template
    binder.bindElements(null, template);
    
    // Assert: Verify the DOM is valid
    expect(binder.vdom).not.toBeNull();
    expect(binder.vdom.elem).toBeDefined();
    
    // Verify it's a valid DOM element
    const element = binder.vdom.elem;
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.tagName).toBe('DIV');
    expect(element.className).toBe('test-container');
    expect(element.textContent).toBe('Hello World');
    
    // Verify DOM can be queried
    expect(element.querySelector).toBeDefined();
    expect(typeof element.querySelector).toBe('function');
    
    // Cleanup
    binder.destroy();
  });

  it("One [if] directives parse to valid DOM (true from start)", function() {
    const template = `
      <div [if]="this.showLevel1" id="div1">
        <span>Level 1 Content</span>
      </div>
    `;
    
    // Create context with all conditions true
    const context = {
      showLevel1: true,
    };
    const binder = new Binder(context);
        
    // Act: Parse and bind the template
    binder.bindElements(null, template);

    // Trigger update to execute directives
    binder.updateElements();
    
    document.body.appendChild(binder.vdom?.fragment || binder.vdom?.elem);
    
    // Check the rendered HTML in the container
    //const html = document.body.innerHTML;
    //console.log('Rendered HTML:', html);

    var div1 = DOM(document.body).find('div#div1').first();

    expect(div1).not.toBeUndefined();
    expect(div1.innerHTML).toContain('Level 1 Content');

    context.showLevel1 = false;
    binder.updateElements();
    var div1 = DOM(document.body).find('div#div1').first();
    expect(div1).toBeUndefined();


    context.showLevel1 = true;
    binder.updateElements();
    var div1 = DOM(document.body).find('div#div1').first();
    expect(div1).not.toBeUndefined();

  });

  it("One [if] directives parse to valid DOM (false from start)", function() {
    const template = `
      <div [if]="this.showLevel1" id="div1">
        <span>Level 1 Content</span>
      </div>
    `;
    
    // Create context with all conditions true
    const context = {
      showLevel1: false,
    };
    const binder = new Binder(context);
        
    // Act: Parse and bind the template
    binder.bindElements(null, template);

    // Trigger update to execute directives
    binder.updateElements();
    document.body.appendChild(binder.vdom?.fragment || binder.vdom?.elem);

    //const html = document.body.innerHTML;
    //console.log('Rendered HTML:', html);
    
    var div1 = DOM(document.body).find('div#div1').first();
    expect(div1).toBeUndefined();

    context.showLevel1 = true;
    binder.updateElements();
    var div1 = DOM(document.body).find('div#div1').first();
    expect(div1).not.toBeUndefined();

    context.showLevel1 = false;
    binder.updateElements();
    var div1 = DOM(document.body).find('div#div1').first();
    expect(div1).toBeUndefined();
  });

  it("Stacked [if] directives with false conditions hide content", function() {
    // Arrange: Create template with nested [if] directives
    const template = `
      <div [if]="this.showLevel1" id="div1">
        Level 1 Content
        <div [if]="this.showLevel2" id="div2">
          Level 2 Content
          <div [if]="this.showLevel3" id="div3">
            Level 3 Content
          </div>
        </div>
      </div>
    `;
    
    // Create context with level 2 false (should hide levels 2 and 3)
    const context = {
      showLevel1: true,
      showLevel2: false,
      showLevel3: true
    };
    const binder = new Binder(context);
    
    // Act: Parse and bind the template
    binder.bindElements(null, template);
    binder.updateElements();

    expect(binder.vdom).not.toBeUndefined();
        
    document.body.appendChild(binder.vdom?.fragment || binder.vdom?.elem);

    //const html = document.body.innerHTML;
    //console.log('Rendered HTML:', html);

    var div1 = DOM(document.body).find("div#div1").first();
    expect(div1).not.toBeUndefined();
    expect(div1?.innerHTML).toContain("Level 1 Content");

    var div2 = DOM(document.body).find("div#div2").first();
    expect(div2).toBeUndefined();

    var div3 = DOM(document.body).find("div#div3").first();
    expect(div3).toBeUndefined();

    context.showLevel2 = true
    binder.updateElements();

    var div2 = DOM(document.body).find("div#div2").first();
    expect(div2).not.toBeUndefined();

    var div3 = DOM(document.body).find("div#div3").first();
    expect(div3).not.toBeUndefined();
  });

  it("Stacked [if]->[component]->[html]->[if] directives parse and update correctly", function() {
    // Create a test component with [html] directive containing nested [if]
    class TestStackedComponent extends BaseComponent {
      htmlContent: string = '';
      showInner: boolean = true;

      constructor() {
        super();
        this.template = `
          <div class="component-wrapper" id="comp-wrapper">
            <h3>Component Content</h3>
            <div [html]="this.htmlContent" id="html-target"></div>
          </div>
        `;
      }

      getHtmlContent(): string {
        return this.htmlContent;
      }
    }

    // Create template with stacked directives:
    // [if] -> [component] -> [html] -> [if]
    const template = `
      <div [if]="this.showComponent" id="outer-if">
        <div [component]="this.testComponent" 
             [htmlContent]="this.dynamicHtml" 
             [showInner]="this.showInnerContent"
             id="component-host"></div>
      </div>
    `;

    // Create context with the component class and control flags
    const context = {
      testComponent: new TestStackedComponent(),
      showComponent: true,
      showInnerContent: true,
      dynamicHtml: `
        <div class="html-content">
          <p>HTML Directive Content</p>
          <div [if]="this.showInner" id="inner-if">
            <span class="inner-content">Inner If Content</span>
          </div>
        </div>
      `
    };

    const binder = new Binder(context);
    binder.bindElements(null, template);
    binder.updateElements();
    document.body.appendChild(binder.vdom?.fragment || binder.vdom?.elem);

    // Test 1: All conditions true - verify full DOM renders
    var outerIf = DOM(document.body).find('#outer-if').first();
    expect(outerIf).not.toBeUndefined();

    var componentWrapper = DOM(document.body).find('#comp-wrapper').first();
    expect(componentWrapper).not.toBeUndefined();
    expect(componentWrapper?.innerHTML).toContain('Component Content');

    var htmlTarget = DOM(document.body).find('#html-target').first();
    expect(htmlTarget).not.toBeUndefined();
    expect(htmlTarget?.innerHTML).toContain('HTML Directive Content');

    var innerIf = DOM(document.body).find('#inner-if').first();
    expect(innerIf).not.toBeUndefined();
    expect(innerIf?.innerHTML).toContain('Inner If Content');

    // Test 2: Toggle inner [if] false - verify only inner content removed
    context.showInnerContent = false;
    binder.updateElements();

    var innerIfHidden = DOM(document.body).find('#inner-if').first();
    expect(innerIfHidden).toBeUndefined();

    // Component and HTML directive should still be present
    var componentStillThere = DOM(document.body).find('#comp-wrapper').first();
    expect(componentStillThere).not.toBeUndefined();

    var htmlStillThere = DOM(document.body).find('.html-content').first();
    expect(htmlStillThere).not.toBeUndefined();

    // Test 3: Toggle inner [if] back true - verify inner content returns
    context.showInnerContent = true;
    binder.updateElements();

    var innerIfBack = DOM(document.body).find('#inner-if').first();
    expect(innerIfBack).not.toBeUndefined();
    expect(innerIfBack?.innerHTML).toContain('Inner If Content');

    // Test 4: Toggle outer [if] false - verify everything removed
    context.showComponent = false;
    binder.updateElements();

    var outerIfHidden = DOM(document.body).find('#outer-if').first();
    expect(outerIfHidden).toBeUndefined();

    var componentHidden = DOM(document.body).find('#comp-wrapper').first();
    expect(componentHidden).toBeUndefined();

    var htmlHidden = DOM(document.body).find('#html-target').first();
    expect(htmlHidden).toBeUndefined();

    // Test 5: Toggle outer [if] back true - verify full re-render
    context.showComponent = true;
    binder.updateElements();

    var outerIfRestored = DOM(document.body).find('#outer-if').first();
    expect(outerIfRestored).not.toBeUndefined();

    var componentRestored = DOM(document.body).find('#comp-wrapper').first();
    expect(componentRestored).not.toBeUndefined();

    var htmlRestored = DOM(document.body).find('#html-target').first();
    expect(htmlRestored).not.toBeUndefined();

    var innerIfRestored = DOM(document.body).find('#inner-if').first();
    expect(innerIfRestored).not.toBeUndefined();

    // Test 6: Update HTML content - verify HTML directive updates
    context.dynamicHtml = `
        <div [if]="this.showInner" id="inner-if-updated">
            <span>Updated Inner Content</span>
        </div>
        <div>Simulate multiroot [html] content</div>
    `;
    binder.updateElements();

    var updatedInnerIf = DOM(document.body).find('#inner-if-updated').first();
    expect(updatedInnerIf).not.toBeUndefined();
    expect(updatedInnerIf?.innerHTML).toContain('Updated Inner Content');


    context.dynamicHtml = `
      <div [if]="this.showInner" id="inner-if-updated">
          <span>Updated Inner Content (sumulate [html]->[if])</span>
      </div>
    `;
    binder.updateElements();

    var updatedInnerIf = DOM(document.body).find('#inner-if-updated').first();
    expect(updatedInnerIf).not.toBeUndefined();
    expect(updatedInnerIf?.innerHTML).toContain('Updated Inner Content');


    // Cleanup
    binder.destroy();
  });

});
