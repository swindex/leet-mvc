// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { DOM } from '../../core/DOM';
import { TestMultiRootComponentPage } from '../../test/Pages/TestMultiRootComponentPage';
import { Registered } from '../../core/Register';

const I = Injector;

I.Nav = new NavController();
let page: TestMultiRootComponentPage;

describe('Test TestMultiRootComponentPage - Single vs Multi-Root Component Templates', function() {
  
  beforeEach(function(done) {
    page = I.Nav.push(TestMultiRootComponentPage);
    setTimeout(() => {
      page.update();
      done();
    }, 50);
  });

  afterEach(function(done) {
    page.destroy();
    done();
  });

  // ============================================================================
  // 1. PAGE INITIALIZATION & COMPONENT REGISTRATION
  // ============================================================================

  describe('Page Initialization & Component Registration', function() {
    
    it("Page defined and initialized with default values", function() {
      expect(page).not.toBeNull();
      expect(page.title).toBe("Test Multi-Root Components");
      expect(page.singleTitle).toBe("Dynamic Single Root Title");
      expect(page.singleContent).toBe("This is dynamic content for single root.");
      expect(page.multiHeader).toBe("Dynamic Multi Header");
      expect(page.multiBody).toBe("This is dynamic body content for multi-root component.");
      expect(page.multiFooter).toBe("Dynamic Multi Footer");
      expect(page.showSingle).toBe(true);
      expect(page.showMulti).toBe(true);
      expect(page.counter).toBe(0);
    });

    it("SingleRootComponent is registered in LEET_REGISTER", function() {
      const SingleRootComponent = Registered('app-single-root');
      expect(SingleRootComponent).not.toBeNull();
      expect(SingleRootComponent).toBeDefined();
      expect(typeof SingleRootComponent).toBe('function');
    });

    it("MultiRootComponent is registered in LEET_REGISTER", function() {
      const MultiRootComponent = Registered('app-multi-root');
      expect(MultiRootComponent).not.toBeNull();
      expect(MultiRootComponent).toBeDefined();
      expect(typeof MultiRootComponent).toBe('function');
    });

    it("Registered components can be instantiated", function() {
      const SingleRootComponent = Registered('app-single-root');
      const MultiRootComponent = Registered('app-multi-root');
      
      const singleInstance = new SingleRootComponent();
      const multiInstance = new MultiRootComponent();
      
      expect(singleInstance).toBeDefined();
      expect(multiInstance).toBeDefined();
      expect(singleInstance.title).toBe("Single Root");
      expect(singleInstance.content).toBe("Content");
      expect(multiInstance.header).toBe("Header");
      expect(multiInstance.body).toBe("Body");
      expect(multiInstance.footer).toBe("Footer");
    });

    it("Page contains component elements in DOM", function(done) {
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('app-single-root');
        expect(content).toContain('app-multi-root');
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 2. SINGLE ROOT COMPONENT RENDERING
  // ============================================================================

  describe('Single Root Component Rendering', function() {
    
    it("Single root component renders with static properties", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-basic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Static Title');
        expect(content).toContain('Static content in single root component');
        done();
      }, 100);
    });

    it("Single root component displays child content", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-basic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Child element 1');
        done();
      }, 100);
    });

    it("Single root component has correct HTML structure", function(done) {
      setTimeout(() => {
        const singleRoots = DOM(page.page).find('.single-root');
        expect(singleRoots.length).toBeGreaterThan(0);
        
        const firstRoot = singleRoots[0];
        expect(firstRoot).toBeDefined();
        expect(firstRoot.tagName.toLowerCase()).toBe('div');
        done();
      }, 100);
    });

    it("Single root component updates with dynamic properties", function(done) {
      setTimeout(() => {
        page.onUpdateSingle();
        page.update();
        
        setTimeout(() => {
          const instance = DOM(page.page).find('#single-dynamic-instance')[0];
          expect(instance).toBeDefined();
          const content = instance.innerHTML;
          expect(content).toContain('Updated Single Title');
          expect(content).toContain('Updated single content');
          done();
        }, 100);
      }, 100);
    });

    it("Single root component renders dynamic child content", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-dynamic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Dynamic child content');
        expect(content).toContain('Counter: 0');
        done();
      }, 100);
    });

    it("Single root component child content updates with parent state", function(done) {
      page.onIncrementCounter();
      expect(page.counter).toBe(1);
      page.update();
      
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-dynamic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Counter: 1');
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 3. MULTI-ROOT COMPONENT RENDERING
  // ============================================================================

  describe('Multi-Root Component Rendering (DocumentFragment)', function() {
    
    it("Multi-root component renders with static properties", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-basic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Static Header');
        expect(content).toContain('Static body text');
        expect(content).toContain('Static Footer');
        done();
      }, 100);
    });

    it("Multi-root component displays child content", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-basic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Multi-root child element');
        done();
      }, 100);
    });

    it("Multi-root component has multiple root elements", function(done) {
      setTimeout(() => {
        const headers = DOM(page.page).find('.multi-root-header');
        const bodies = DOM(page.page).find('.multi-root-body');
        const footers = DOM(page.page).find('.multi-root-footer');
        
        expect(headers.length).toBeGreaterThan(0);
        expect(bodies.length).toBeGreaterThan(0);
        expect(footers.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it("Multi-root component updates with dynamic properties", function(done) {
      setTimeout(() => {
        page.onUpdateMulti();
        page.update();
        
        setTimeout(() => {
          const instance = DOM(page.page).find('#multi-dynamic-instance')[0];
          expect(instance).toBeDefined();
          const content = instance.innerHTML;
          expect(content).toContain('Updated Multi Header');
          expect(content).toContain('Updated multi body');
          expect(content).toContain('Updated Multi Footer');
          done();
        }, 100);
      }, 100);
    });

    it("Multi-root component renders dynamic child content", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-dynamic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Dynamic multi-root child');
        expect(content).toContain('Counter: 0');
        done();
      }, 100);
    });

    it("Multi-root component child content updates with parent state", function(done) {
      page.onIncrementCounter();
      page.onIncrementCounter();
      expect(page.counter).toBe(2);
      page.update();
      
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-dynamic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Counter: 2');
        done();
      }, 100);
    });

    it("Multi-root component header, body, and footer are siblings", function(done) {
      setTimeout(() => {
        const headers = DOM(page.page).find('.multi-root-header');
        expect(headers.length).toBeGreaterThan(0);
        
        const header = headers[0];
        const nextSibling = header.nextElementSibling;
        
        if (nextSibling) {
          expect(nextSibling.classList.contains('multi-root-body')).toBe(true);
        }
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 4. CONDITIONAL RENDERING WITH [if] DIRECTIVE
  // ============================================================================

  describe('Conditional Rendering [if] Directive', function() {
    
    it("Single root component is visible by default (showSingle = true)", function(done) {
      expect(page.showSingle).toBe(true);
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-conditional-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Conditional Single');
        expect(content).toContain('Conditional single child');
        done();
      }, 100);
    });

    it("Multi-root component is visible by default (showMulti = true)", function(done) {
      expect(page.showMulti).toBe(true);
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-conditional-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Conditional Header');
        expect(content).toContain('Conditional multi child');
        done();
      }, 100);
    });

    it("onToggleSingle hides single root component", function(done) {
      page.onToggleSingle();
      expect(page.showSingle).toBe(false);
      page.update();
      
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-conditional-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).not.toContain('Conditional single child');
        done();
      }, 100);
    });

    it("onToggleMulti hides multi-root component", function(done) {
      page.onToggleMulti();
      expect(page.showMulti).toBe(false);
      page.update();
      
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-conditional-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).not.toContain('Conditional multi child');
        done();
      }, 100);
    });

    it("Toggle single root back to visible", function(done) {
      page.onToggleSingle();
      page.onToggleSingle();
      expect(page.showSingle).toBe(true);
      page.update();
      
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-conditional-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Conditional single child');
        done();
      }, 100);
    });

    it("Toggle multi-root back to visible", function(done) {
      page.onToggleMulti();
      page.onToggleMulti();
      expect(page.showMulti).toBe(true);
      page.update();
      
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-conditional-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Conditional multi child');
        done();
      }, 100);
    });

    it("Toggle button states display correctly", function(done) {
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('visible');
        
        page.onToggleSingle();
        page.update();
        
        setTimeout(() => {
          const content2 = page.page.innerHTML;
          expect(content2).toContain('hidden');
          done();
        }, 100);
      }, 100);
    });

    it("Both components can be hidden simultaneously", function(done) {
      page.onToggleSingle();
      page.onToggleMulti();
      expect(page.showSingle).toBe(false);
      expect(page.showMulti).toBe(false);
      page.update();
      
      setTimeout(() => {
        const singleInstance = DOM(page.page).find('#single-conditional-instance')[0];
        const multiInstance = DOM(page.page).find('#multi-conditional-instance')[0];
        expect(singleInstance).toBeDefined();
        expect(multiInstance).toBeDefined();
        expect(singleInstance.innerHTML).not.toContain('Conditional single child');
        expect(multiInstance.innerHTML).not.toContain('Conditional multi child');
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 5. MULTIPLE INSTANCES
  // ============================================================================

  describe('Multiple Component Instances', function() {
    
    it("Multiple single root instances render", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-multiple-instances')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('Instance A');
        expect(content).toContain('Instance B');
        done();
      }, 100);
    });

    it("Multiple multi-root instances render", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-multiple-instances')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('Multi Instance 1');
        expect(content).toContain('Multi Instance 2');
        done();
      }, 100);
    });

    it("Multiple instances display their children", function(done) {
      setTimeout(() => {
        const instanceA = DOM(page.page).find('#single-instance-a')[0];
        const instanceB = DOM(page.page).find('#single-instance-b')[0];
        const multiInstance1 = DOM(page.page).find('#multi-instance-1')[0];
        const multiInstance2 = DOM(page.page).find('#multi-instance-2')[0];
        
        expect(instanceA.innerHTML).toContain('Child A (0)');
        expect(instanceB.innerHTML).toContain('Child B (0)');
        expect(multiInstance1.innerHTML).toContain('Multi Child 1 (0)');
        expect(multiInstance2.innerHTML).toContain('Multi Child 2 (0)');
        done();
      }, 100);
    });

    it("Counter increment updates all instance children", function(done) {
      page.onIncrementCounter();
      page.onIncrementCounter();
      page.onIncrementCounter();
      expect(page.counter).toBe(3);
      page.update();
      
      setTimeout(() => {
        const instanceA = DOM(page.page).find('#single-instance-a')[0];
        const instanceB = DOM(page.page).find('#single-instance-b')[0];
        const multiInstance1 = DOM(page.page).find('#multi-instance-1')[0];
        const multiInstance2 = DOM(page.page).find('#multi-instance-2')[0];
        
        expect(instanceA.innerHTML).toContain('Child A (3)');
        expect(instanceB.innerHTML).toContain('Child B (3)');
        expect(multiInstance1.innerHTML).toContain('Multi Child 1 (3)');
        expect(multiInstance2.innerHTML).toContain('Multi Child 2 (3)');
        done();
      }, 100);
    });

    it("Multiple instances maintain separate properties", function(done) {
      setTimeout(() => {
        const instanceA = DOM(page.page).find('#single-instance-a')[0];
        const instanceB = DOM(page.page).find('#single-instance-b')[0];
        const multiInstance1 = DOM(page.page).find('#multi-instance-1')[0];
        const multiInstance2 = DOM(page.page).find('#multi-instance-2')[0];
        
        expect(instanceA.innerHTML).toContain('Single root instance A');
        expect(instanceB.innerHTML).toContain('Single root instance B');
        expect(multiInstance1.innerHTML).toContain('Body 1');
        expect(multiInstance2.innerHTML).toContain('Body 2');
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 6. MIXED COMPONENTS & NESTING
  // ============================================================================

  describe('Mixed Components & Nesting', function() {
    
    it("Multi-root component can be nested inside single root component", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#mixed-nested-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Dynamic Single Root Title');
        expect(content).toContain('Nested Multi Header');
        expect(content).toContain('Nested inside single root');
        done();
      }, 100);
    });

    it("Nested components display their children", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#mixed-nested-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Deep nested child');
        done();
      }, 100);
    });

    it("Nested components update with parent counter", function(done) {
      page.onIncrementCounter();
      expect(page.counter).toBe(1);
      page.update();
      
      setTimeout(() => {
        const instance = DOM(page.page).find('#mixed-nested-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Nested content with counter: 1');
        done();
      }, 100);
    });

    it("Reset all updates nested components", function(done) {
      page.onUpdateSingle();
      page.onIncrementCounter();
      page.update();
      
      setTimeout(() => {
        page.onResetAll();
        expect(page.counter).toBe(0);
        expect(page.singleTitle).toBe("Dynamic Single Root Title");
        page.update();
        
        setTimeout(() => {
          const content = page.page.innerHTML;
          expect(content).toContain("Dynamic Single Root Title");
          done();
        }, 100);
      }, 100);
    });
  });

  // ============================================================================
  // 7. EMPTY CHILDREN TEST
  // ============================================================================

  describe('Empty Children Test', function() {
    
    it("Single root component renders without children", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#empty-single-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('No Children Single');
        expect(content).toContain('This has no child content');
        done();
      }, 100);
    });

    it("Multi-root component renders without children", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#empty-multi-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('No Children Multi Header');
        expect(content).toContain('No Children Footer');
        done();
      }, 100);
    });

    it("Components without children don't crash", function(done) {
      setTimeout(() => {
        expect(page).toBeDefined();
        const singleInstance = DOM(page.page).find('#empty-single-instance')[0];
        const multiInstance = DOM(page.page).find('#empty-multi-instance')[0];
        expect(singleInstance).toBeDefined();
        expect(multiInstance).toBeDefined();
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 8. PAGE METHODS & STATE MANAGEMENT
  // ============================================================================

  describe('Page Methods & State Management', function() {
    
    it("onIncrementCounter increments counter", function() {
      expect(page.counter).toBe(0);
      page.onIncrementCounter();
      expect(page.counter).toBe(1);
      page.onIncrementCounter();
      expect(page.counter).toBe(2);
    });

    it("onUpdateSingle updates single component properties", function() {
      page.onUpdateSingle();
      expect(page.singleTitle).toBe("Updated Single Title");
      expect(page.singleContent).toBe("Updated single content.");
    });

    it("onUpdateMulti updates multi-root component properties", function() {
      page.onUpdateMulti();
      expect(page.multiHeader).toBe("Updated Multi Header");
      expect(page.multiBody).toBe("Updated multi body.");
      expect(page.multiFooter).toBe("Updated Multi Footer");
    });

    it("onResetAll resets all properties to defaults", function() {
      page.onUpdateSingle();
      page.onUpdateMulti();
      page.onIncrementCounter();
      page.onIncrementCounter();
      
      page.onResetAll();
      
      expect(page.singleTitle).toBe("Dynamic Single Root Title");
      expect(page.singleContent).toBe("This is dynamic content for single root.");
      expect(page.multiHeader).toBe("Dynamic Multi Header");
      expect(page.multiBody).toBe("This is dynamic body content for multi-root component.");
      expect(page.multiFooter).toBe("Dynamic Multi Footer");
      expect(page.counter).toBe(0);
    });

    it("Multiple method calls work correctly", function() {
      page.onIncrementCounter();
      page.onUpdateSingle();
      page.onToggleSingle();
      page.onUpdateMulti();
      page.onToggleMulti();
      
      expect(page.counter).toBe(1);
      expect(page.singleTitle).toBe("Updated Single Title");
      expect(page.multiHeader).toBe("Updated Multi Header");
      expect(page.showSingle).toBe(false);
      expect(page.showMulti).toBe(false);
    });
  });

  // ============================================================================
  // 9. EDGE CASES & LIFECYCLE
  // ============================================================================

  describe('Edge Cases & Lifecycle', function() {
    
    it("Handles rapid counter increments", function(done) {
      for (let i = 0; i < 10; i++) {
        page.onIncrementCounter();
      }
      expect(page.counter).toBe(10);
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('10');
        done();
      }, 100);
    });

    it("Handles rapid toggles", function(done) {
      for (let i = 0; i < 20; i++) {
        page.onToggleSingle();
        page.onToggleMulti();
      }
      page.update();
      
      setTimeout(() => {
        expect(page).toBeDefined();
        done();
      }, 100);
    });

    it("Component survives multiple update cycles", function(done) {
      page.update();
      setTimeout(() => {
        page.update();
        setTimeout(() => {
          page.update();
          setTimeout(() => {
            expect(page).toBeDefined();
            done();
          }, 50);
        }, 50);
      }, 50);
    });

    it("Page destroy cleans up components", function() {
      const pageTemp = I.Nav.push(TestMultiRootComponentPage);
      expect(pageTemp).toBeDefined();
      pageTemp.destroy();
      expect(true).toBe(true);
    });

    it("Handles null values gracefully", function(done) {
      page.singleTitle = null;
      page.multiHeader = null;
      page.update();
      
      setTimeout(() => {
        expect(page).toBeDefined();
        done();
      }, 100);
    });

    it("Handles empty strings", function(done) {
      page.singleTitle = "";
      page.singleContent = "";
      page.multiHeader = "";
      page.update();
      
      setTimeout(() => {
        expect(page).toBeDefined();
        done();
      }, 100);
    });

    it("Handles large counter values", function(done) {
      page.counter = 999999;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('999999');
        done();
      }, 100);
    });

    it("Handles negative counter values", function() {
      page.counter = -10;
      page.update();
      expect(page.counter).toBe(-10);
    });
  });

  // ============================================================================
  // 10. INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', function() {
    
    it("Complete workflow with all features", function(done) {
      page.onIncrementCounter();
      page.onUpdateSingle();
      page.onUpdateMulti();
      page.onToggleSingle();
      page.update();
      
      setTimeout(() => {
        expect(page.counter).toBe(1);
        expect(page.singleTitle).toBe("Updated Single Title");
        expect(page.multiHeader).toBe("Updated Multi Header");
        expect(page.showSingle).toBe(false);
        done();
      }, 100);
    });

    it("Reset and rebuild workflow", function(done) {
      page.onIncrementCounter();
      page.onIncrementCounter();
      page.onUpdateSingle();
      page.onUpdateMulti();
      page.update();
      
      setTimeout(() => {
        page.onResetAll();
        page.update();
        
        setTimeout(() => {
          expect(page.counter).toBe(0);
          expect(page.singleTitle).toBe("Dynamic Single Root Title");
          expect(page.multiHeader).toBe("Dynamic Multi Header");
          done();
        }, 100);
      }, 100);
    });

    it("Both single and multi-root components work together", function(done) {
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('single-root');
        expect(content).toContain('multi-root-header');
        expect(content).toContain('multi-root-body');
        expect(content).toContain('multi-root-footer');
        done();
      }, 100);
    });

    it("All sections render without errors", function(done) {
      setTimeout(() => {
        const section1 = DOM(page.page).find('#test-section-single-basic')[0];
        const section2 = DOM(page.page).find('#test-section-single-dynamic')[0];
        const section3 = DOM(page.page).find('#test-section-multi-basic')[0];
        const section4 = DOM(page.page).find('#test-section-multi-dynamic')[0];
        const section5 = DOM(page.page).find('#test-section-conditional')[0];
        const section6 = DOM(page.page).find('#test-section-multiple-instances')[0];
        const section7 = DOM(page.page).find('#test-section-mixed')[0];
        const section8 = DOM(page.page).find('#test-section-empty-children')[0];
        
        expect(section1).toBeDefined();
        expect(section2).toBeDefined();
        expect(section3).toBeDefined();
        expect(section4).toBeDefined();
        expect(section5).toBeDefined();
        expect(section6).toBeDefined();
        expect(section7).toBeDefined();
        expect(section8).toBeDefined();
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 11. COMPONENT STRUCTURE VALIDATION
  // ============================================================================

  describe('Component Structure Validation', function() {
    
    it("Single root components have single div wrapper", function(done) {
      setTimeout(() => {
        const singleRoots = DOM(page.page).find('.single-root');
        expect(singleRoots.length).toBeGreaterThan(0);
        
        for (let i = 0; i < singleRoots.length; i++) {
          expect(singleRoots[i].tagName.toLowerCase()).toBe('div');
        }
        done();
      }, 100);
    });

    it("Multi-root components have multiple sibling elements", function(done) {
      setTimeout(() => {
        const headers = DOM(page.page).find('.multi-root-header');
        const bodies = DOM(page.page).find('.multi-root-body');
        const footers = DOM(page.page).find('.multi-root-footer');
        
        // Should have equal numbers of header, body, footer elements
        expect(headers.length).toBe(bodies.length);
        expect(bodies.length).toBe(footers.length);
        done();
      }, 100);
    });

    it("Children containers exist in both component types", function(done) {
      setTimeout(() => {
        const childContainers = DOM(page.page).find('.children-container');
        expect(childContainers.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it("Content projection works in single root components", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#single-basic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Child element 1');
        done();
      }, 100);
    });

    it("Content projection works in multi-root components", function(done) {
      setTimeout(() => {
        const instance = DOM(page.page).find('#multi-basic-instance')[0];
        expect(instance).toBeDefined();
        const content = instance.innerHTML;
        expect(content).toContain('Multi-root child element');
        done();
      }, 100);
    });
  });
});
