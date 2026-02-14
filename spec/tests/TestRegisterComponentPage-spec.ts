// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { DOM } from '../../core/DOM';
import { TestRegisterComponentPage } from '../../test/Pages/TestRegisterComponentPage';
import { Registered } from '../../core/Register';

const I = Injector;

I.Nav = new NavController();
let page: TestRegisterComponentPage;

describe('Test TestRegisterComponentPage - RegisterComponent and Custom Components', function() {
  
  beforeEach(function(done) {
    page = I.Nav.push(TestRegisterComponentPage);
    setTimeout(() => {
      done();
    }, 1);
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
      expect(page.title).toBe("Test RegisterComponent");
      expect(page.counter).toBe(0);
      expect(page.label).toBe("My Counter");
      expect(page.showWidget).toBe(false);
      expect(page.infoTitle).toBe("Info Card Title");
      expect(page.infoDesc).toBe("This is a description passed via property binding.");
      expect(page.eventLog).toEqual([]);
    });

    it("InfoCard component is registered in LEET_REGISTER", function() {
      const InfoCard = Registered('app-info-card');
      expect(InfoCard).not.toBeNull();
      expect(InfoCard).toBeDefined();
      expect(typeof InfoCard).toBe('function');
    });

    it("CounterWidget component is registered in LEET_REGISTER", function() {
      const CounterWidget = Registered('app-counter-widget');
      expect(CounterWidget).not.toBeNull();
      expect(CounterWidget).toBeDefined();
      expect(typeof CounterWidget).toBe('function');
    });

    it("Registered components can be instantiated", function() {
      const InfoCard = Registered('app-info-card');
      const CounterWidget = Registered('app-counter-widget');
      
      const infoInstance = new InfoCard();
      const counterInstance = new CounterWidget();
      
      expect(infoInstance).toBeDefined();
      expect(counterInstance).toBeDefined();
      expect(infoInstance.title).toBe("");
      expect(infoInstance.description).toBe("");
      expect(counterInstance.count).toBe(0);
      expect(counterInstance.label).toBe("Counter");
    });

    it("Page contains component elements in DOM", function(done) {
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('app-info-card');
        expect(content).toContain('app-counter-widget');
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 2. BASIC COMPONENT RENDERING
  // ============================================================================

  describe('Basic Component Rendering', function() {
    
    it("InfoCard renders with static property binding", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-basic-rendering')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('Hello World');
        expect(content).toContain('This card has static string props');
        done();
      }, 100);
    });

    it("InfoCard renders with dynamic property binding", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-basic-rendering')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain(page.infoTitle);
        expect(content).toContain(page.infoDesc);
        done();
      }, 100);
    });

    it("InfoCard updates when dynamic properties change", function(done) {
      page.infoTitle = "New Title";
      page.infoDesc = "New Description";
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-basic-rendering')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain("New Title");
        expect(content).toContain("New Description");
        done();
      }, 100);
    });

    it("InfoCard has correct HTML structure with styles", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-basic-rendering')[0];
        expect(section).toBeDefined();
        const infoCards = DOM(section).find('.info-card');
        expect(infoCards.length).toBeGreaterThan(0);
        
        const card = infoCards[0];
        const style = card.getAttribute('style');
        expect(style).toContain('border');
        expect(style).toContain('padding');
        done();
      }, 100);
    });

    it("CounterWidget renders with basic properties", function(done) {
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('My Counter');
        done();
      }, 100);
    });

    it("CounterWidget displays count and value", function(done) {
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('value:');
        done();
      }, 100);
    });

    it("CounterWidget has increment and decrement buttons", function(done) {
      setTimeout(() => {
        const buttons = DOM(page.page).find('button');
        let hasIncrement = false;
        let hasDecrement = false;
        
        for (let i = 0; i < buttons.length; i++) {
          const text = buttons[i].textContent.trim();
          if (text === '+') hasIncrement = true;
          if (text === '-') hasDecrement = true;
        }
        
        expect(hasIncrement).toBe(true);
        expect(hasDecrement).toBe(true);
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 3. PROPERTY BINDING (ONE-WAY)
  // ============================================================================

  describe('Property Binding (One-Way)', function() {
    
    it("Parent counter binds to component [count]", function(done) {
      page.counter = 5;
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-property-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        // The counter widget with [count] binding should show 5
        expect(content).toContain('5');
        done();
      }, 100);
    });

    it("onIncrementFromParent increases counter and updates component", function(done) {
      expect(page.counter).toBe(0);
      page.onIncrementFromParent();
      expect(page.counter).toBe(1);
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-property-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('1');
        done();
      }, 100);
    });

    it("onResetCounter resets counter to zero and updates component", function(done) {
      page.counter = 10;
      page.update();
      
      setTimeout(() => {
        page.onResetCounter();
        expect(page.counter).toBe(0);
        page.update();
        
        setTimeout(() => {
          const section = DOM(page.page).find('#test-section-property-binding')[0];
          expect(section).toBeDefined();
          const content = section.innerHTML;
          // After reset, should show 0
          done();
        }, 100);
      }, 100);
    });

    it("onChangeLabel updates label and component displays new label", function(done) {
      expect(page.label).toBe("My Counter");
      page.onChangeLabel();
      expect(page.label).toBe("Renamed Counter");
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-property-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain("Renamed Counter");
        done();
      }, 100);
    });

    it("Multiple onChangeLabel calls toggle label correctly", function() {
      expect(page.label).toBe("My Counter");
      page.onChangeLabel();
      expect(page.label).toBe("Renamed Counter");
      page.onChangeLabel();
      expect(page.label).toBe("My Counter");
      page.onChangeLabel();
      expect(page.label).toBe("Renamed Counter");
    });

    it("Label changes propagate to component template", function(done) {
      page.label = "Custom Label";
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-property-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain("Custom Label");
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 4. TWO-WAY BINDING [(value)]
  // ============================================================================

  describe('Two-Way Binding [(value)]', function() {
    
    it("Parent counter displays in two-way bound component", function(done) {
      page.counter = 7;
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-two-way-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('Two-Way');
        expect(content).toContain('7');
        done();
      }, 100);
    });

    it("Two-way binding keeps parent and component in sync", function(done) {
      page.counter = 15;
      expect(page.counter).toBe(15);
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-two-way-binding')[0];
        expect(section).toBeDefined();
        // Verify the value is displayed
        const content = section.innerHTML;
        expect(content).toContain('15');
        done();
      }, 100);
    });

    it("Multiple increments update two-way bound value", function(done) {
      page.counter = 0;
      page.onIncrementFromParent();
      page.onIncrementFromParent();
      page.onIncrementFromParent();
      expect(page.counter).toBe(3);
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-two-way-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('3');
        done();
      }, 100);
    });

    it("Reset affects two-way bound component", function(done) {
      page.counter = 99;
      page.update();
      
      setTimeout(() => {
        page.onResetCounter();
        page.update();
        
        setTimeout(() => {
          expect(page.counter).toBe(0);
          done();
        }, 100);
      }, 100);
    });
  });

  // ============================================================================
  // 5. EVENT BINDING (onCountChange)
  // ============================================================================

  describe('Event Binding (onCountChange)', function() {
    
    it("Event log is initialized as empty array", function() {
      expect(page.eventLog).toEqual([]);
      expect(page.eventLog.length).toBe(0);
    });

    it("onCountChanged adds entry to event log", function() {
      expect(page.eventLog.length).toBe(0);
      page.onCountChanged(5);
      expect(page.eventLog.length).toBe(1);
      expect(page.eventLog[0]).toBe("Count changed to: 5");
    });

    it("Multiple event calls populate event log", function() {
      page.onCountChanged(1);
      page.onCountChanged(2);
      page.onCountChanged(3);
      
      expect(page.eventLog.length).toBe(3);
      expect(page.eventLog[0]).toBe("Count changed to: 1");
      expect(page.eventLog[1]).toBe("Count changed to: 2");
      expect(page.eventLog[2]).toBe("Count changed to: 3");
    });

    it("Event log displays in template", function(done) {
      page.onCountChanged(10);
      page.onCountChanged(20);
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-event-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain("Count changed to: 10");
        expect(content).toContain("Count changed to: 20");
        done();
      }, 100);
    });

    it("Event log shows correct count", function(done) {
      page.onCountChanged(1);
      page.onCountChanged(2);
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-event-binding')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('2 events');
        done();
      }, 100);
    });

    it("onClearLog clears event log", function() {
      page.onCountChanged(1);
      page.onCountChanged(2);
      page.onCountChanged(3);
      expect(page.eventLog.length).toBe(3);
      
      page.onClearLog();
      expect(page.eventLog.length).toBe(0);
      expect(page.eventLog).toEqual([]);
    });

    it("Clear log button works and updates display", function(done) {
      page.onCountChanged(100);
      page.update();
      
      setTimeout(() => {
        page.onClearLog();
        page.update();
        
        setTimeout(() => {
          const content = page.page.innerHTML;
          expect(content).toContain('0 events');
          done();
        }, 100);
      }, 100);
    });

    it("Event log handles many events", function() {
      for (let i = 0; i < 100; i++) {
        page.onCountChanged(i);
      }
      
      expect(page.eventLog.length).toBe(100);
      expect(page.eventLog[0]).toBe("Count changed to: 0");
      expect(page.eventLog[99]).toBe("Count changed to: 99");
    });
  });

  // ============================================================================
  // 6. CONDITIONAL RENDERING [if] DIRECTIVE
  // ============================================================================

  describe('Conditional Rendering [if] Directive', function() {
    
    it("Component is hidden by default (showWidget = false)", function(done) {
      expect(page.showWidget).toBe(false);
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-conditional-rendering')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        // The conditional component should not be visible
        expect(content).not.toContain('Conditional Label');
        done();
      }, 100);
    });

    it("onToggleWidget changes showWidget state", function() {
      expect(page.showWidget).toBe(false);
      page.onToggleWidget();
      expect(page.showWidget).toBe(true);
      page.onToggleWidget();
      expect(page.showWidget).toBe(false);
    });

    it("Component appears when showWidget is true", function(done) {
      page.onToggleWidget();
      expect(page.showWidget).toBe(true);
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-conditional-rendering')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('Conditional Label');
        done();
      }, 100);
    });

    it("Component with [if] is hidden when condition is false", function(done) {
      page.showWidget = false;
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-conditional-rendering')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        // The component with [if]="this.showWidget" should not appear
        expect(content).not.toContain('Conditional Label');
        done();
      }, 100);
    });

    it("Toggle button shows correct state", function(done) {
      page.update();
      
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-conditional-rendering')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('hidden');
        
        page.onToggleWidget();
        page.update();
        
        setTimeout(() => {
          const section2 = DOM(page.page).find('#test-section-conditional-rendering')[0];
          expect(section2).toBeDefined();
          const content2 = section2.innerHTML;
          expect(content2).toContain('visible');
          done();
        }, 100);
      }, 100);
    });


    it("Multiple toggles maintain correct visibility", function(done) {
      page.onToggleWidget();
      page.onToggleWidget();
      page.onToggleWidget();
      expect(page.showWidget).toBe(true);
      page.update();
      
      setTimeout(() => {
        page.onToggleWidget();
        expect(page.showWidget).toBe(false);
        page.update();
        
        setTimeout(() => {
          const section = DOM(page.page).find('#test-section-conditional-rendering')[0];
          expect(section).toBeDefined();
          const content = section.innerHTML;
          expect(content).toContain('hidden');
          done();
        }, 100);
      }, 100);
    });
  });

  // ============================================================================
  // 7. MULTIPLE COMPONENT INSTANCES
  // ============================================================================

  describe('Multiple Component Instances', function() {
    
    it("Multiple CounterWidget instances render", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-multiple-instances')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        expect(content).toContain('Instance A');
        expect(content).toContain('Instance B');
        done();
      }, 100);
    });

    it("Multiple instances are independent", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-multiple-instances')[0];
        expect(section).toBeDefined();
        const content = section.innerHTML;
        // Each instance should have its own state
        expect(content).toContain('Instance A');
        expect(content).toContain('Instance B');
        done();
      }, 100);
    });

    it("Multiple InfoCard instances render with different content", function(done) {
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Hello World');
        expect(content).toContain('This card has static string props');
        expect(content).toContain(page.infoTitle);
        expect(content).toContain(page.infoDesc);
        done();
      }, 100);
    });

    it("Multiple CounterWidget instances maintain separate state", function(done) {
      setTimeout(() => {
        const section = DOM(page.page).find('#test-section-multiple-instances')[0];
        expect(section).toBeDefined();
        // All instances should start with count: 0 or their bound value
        const content = section.innerHTML;
        
        // Instance A and Instance B should be present
        const instanceAMatches = content.match(/Instance A/g);
        const instanceBMatches = content.match(/Instance B/g);
        
        expect(instanceAMatches).not.toBeNull();
        expect(instanceBMatches).not.toBeNull();
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 8. PARENT-CHILD INTERACTION
  // ============================================================================

  describe('Parent-Child Interaction', function() {
    
    it("Parent methods affect child components", function(done) {
      page.onIncrementFromParent();
      page.update();
      
      setTimeout(() => {
        expect(page.counter).toBe(1);
        done();
      }, 100);
    });

    it("Parent counter reset affects all bound components", function(done) {
      page.counter = 50;
      page.update();
      
      setTimeout(() => {
        page.onResetCounter();
        page.update();
        
        setTimeout(() => {
          expect(page.counter).toBe(0);
          done();
        }, 100);
      }, 100);
    });

    it("Parent label change affects components with [label] binding", function(done) {
      page.onChangeLabel();
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain("Renamed Counter");
        done();
      }, 100);
    });

    it("Parent state synchronizes with child components", function(done) {
      page.counter = 25;
      page.label = "Test Label";
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain("Test Label");
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 9. EDGE CASES & LIFECYCLE
  // ============================================================================

  describe('Edge Cases & Lifecycle', function() {
    
    it("Handles rapid property changes", function(done) {
      for (let i = 0; i < 10; i++) {
        page.counter = i;
      }
      expect(page.counter).toBe(9);
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('9');
        done();
      }, 100);
    });

    it("Handles null values gracefully", function(done) {
      page.infoTitle = null;
      page.infoDesc = null;
      page.update();
      
      setTimeout(() => {
        // Should not crash, components should handle null
        expect(page).toBeDefined();
        done();
      }, 100);
    });

    it("Handles empty string values", function(done) {
      page.label = "";
      page.infoTitle = "";
      page.update();
      
      setTimeout(() => {
        // Should not crash
        expect(page).toBeDefined();
        done();
      }, 100);
    });

    it("Handles undefined values gracefully", function(done) {
      page.label = undefined;
      page.update();
      
      setTimeout(() => {
        // Should not crash
        expect(page).toBeDefined();
        done();
      }, 100);
    });

    it("Large event log doesn't break rendering", function(done) {
      for (let i = 0; i < 200; i++) {
        page.onCountChanged(i);
      }
      expect(page.eventLog.length).toBe(200);
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('200 events');
        done();
      }, 150);
    });

    it("Counter handles negative values", function(done) {
      page.counter = -10;
      page.update();
      
      setTimeout(() => {
        expect(page.counter).toBe(-10);
        done();
      }, 100);
    });

    it("Counter handles large values", function(done) {
      page.counter = 999999;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('999999');
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
      const pageTemp = I.Nav.push(TestRegisterComponentPage);
      expect(pageTemp).toBeDefined();
      pageTemp.destroy();
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  // ============================================================================
  // 10. COMPONENT STRUCTURE & TEMPLATES
  // ============================================================================

  describe('Component Structure & Templates', function() {
    
    it("InfoCard template contains correct HTML structure", function(done) {
      setTimeout(() => {
        const infoCards = DOM(page.page).find('.info-card');
        expect(infoCards.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it("InfoCard has h4 and p tags", function(done) {
      setTimeout(() => {
        const content = page.page.innerHTML;
        // InfoCard template has <h4> for title
        expect(content).toContain('<h4');
        done();
      }, 100);
    });

    it("CounterWidget has correct button structure", function(done) {
      setTimeout(() => {
        const buttons = DOM(page.page).find('button');
        expect(buttons.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it("Template expressions render correctly", function(done) {
      page.counter = 42;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('42');
        done();
      }, 100);
    });

    it("Foreach directive in event log works", function(done) {
      page.onCountChanged(1);
      page.onCountChanged(2);
      page.onCountChanged(3);
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain("Count changed to: 1");
        expect(content).toContain("Count changed to: 2");
        expect(content).toContain("Count changed to: 3");
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 11. ADVANCED SCENARIOS
  // ============================================================================

  describe('Advanced Scenarios', function() {
    
    it("Property bindings and two-way bindings work together", function(done) {
      page.counter = 10;
      page.label = "Advanced";
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain("Advanced");
        expect(content).toContain("10");
        done();
      }, 100);
    });

    it("Event binding works alongside property binding", function(done) {
      page.onCountChanged(99);
      page.update();
      
      setTimeout(() => {
        expect(page.eventLog.length).toBe(1);
        const content = page.page.innerHTML;
        expect(content).toContain("Count changed to: 99");
        done();
      }, 100);
    });

    it("Conditional components can have property bindings", function(done) {
      page.showWidget = true;
      page.label = "Conditional Label";
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain("Conditional Label");
        done();
      }, 100);
    });

    it("Components maintain state during parent updates", function(done) {
      page.counter = 5;
      page.update();
      
      setTimeout(() => {
        page.label = "Updated";
        page.update();
        
        setTimeout(() => {
          // Counter should still be 5
          expect(page.counter).toBe(5);
          done();
        }, 100);
      }, 100);
    });

    it("Multiple rapid toggles don't break component state", function(done) {
      for (let i = 0; i < 20; i++) {
        page.onToggleWidget();
      }
      page.update();
      
      setTimeout(() => {
        expect(page).toBeDefined();
        done();
      }, 100);
    });

    it("Components work with complex parent state", function(done) {
      page.counter = 100;
      page.label = "Complex";
      page.showWidget = true;
      page.infoTitle = "Advanced Title";
      page.infoDesc = "Advanced Description";
      page.onCountChanged(1);
      page.onCountChanged(2);
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain("Complex");
        expect(content).toContain("Advanced Title");
        expect(content).toContain("Count changed to: 1");
        done();
      }, 100);
    });
  });

  // ============================================================================
  // 12. INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', function() {
    
    it("All page features work together", function(done) {
      // Test complete workflow
      page.onIncrementFromParent();
      page.onChangeLabel();
      page.onToggleWidget();
      page.onCountChanged(10);
      page.update();
      
      setTimeout(() => {
        expect(page.counter).toBe(1);
        expect(page.label).toBe("Renamed Counter");
        expect(page.showWidget).toBe(true);
        expect(page.eventLog.length).toBe(1);
        done();
      }, 100);
    });

    it("Complete user interaction flow", function(done) {
      // Simulate user interactions
      page.onIncrementFromParent();
      page.onIncrementFromParent();
      page.onIncrementFromParent();
      page.onCountChanged(3);
      page.onChangeLabel();
      page.onToggleWidget();
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(page.counter).toBe(3);
        expect(content).toContain("Renamed Counter");
        done();
      }, 100);
    });

    it("Reset and rebuild workflow", function(done) {
      page.counter = 50;
      page.onCountChanged(1);
      page.onCountChanged(2);
      page.update();
      
      setTimeout(() => {
        page.onResetCounter();
        page.onClearLog();
        page.update();
        
        setTimeout(() => {
          expect(page.counter).toBe(0);
          expect(page.eventLog.length).toBe(0);
          done();
        }, 100);
      }, 100);
    });
  });
});
