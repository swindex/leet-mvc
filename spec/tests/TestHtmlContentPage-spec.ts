// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';
import { TestHtmlContentPage } from '../../test/Pages/TestHtmlContentPage';

const I= Injector;

I.Nav = new NavController();
let page: TestHtmlContentPage;

describe('Test TestHtmlContentPage - [html], [innerhtml], and template expressions', function() {
  beforeEach(function(done) {
    page = I.Nav.push(TestHtmlContentPage);
    setTimeout(() => {
      done();
    }, 1);
  });

  afterEach(function(done) {
    page.destroy();
    done();
  });

  it("Page defined and initialized with default values", function() {
    expect(page).not.toBeNull();
    expect(page.htmlContent).toContain('<strong>Bold Text</strong>');
    expect(page.counter).toBe(0);
    expect(page.userName).toBe('John Doe');
    expect(page.items).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it("[html] directive renders HTML content", function(done) {
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Bold Text');
      expect(content).toContain('Italic Text');
      done();
    }, 100);
  });

  it("updateHtmlContent generates new HTML", function() {
    const originalContent = page.htmlContent;
    page.updateHtmlContent();
    expect(page.htmlContent).not.toBe(originalContent);
    expect(page.htmlContent).toContain('<div style=');
  });

  it("clearHtml empties HTML content", function() {
    page.clearHtml();
    expect(page.htmlContent).toBe('');
    expect(page.dynamicHtml).toBe('');
  });

  it("loadComplexHtml generates table structure", function() {
    page.loadComplexHtml();
    expect(page.dynamicHtml).toContain('<table');
    expect(page.dynamicHtml).toContain('Counter');
    expect(page.dynamicHtml).toContain('User');
  });

  it("generateList creates list from items array", function() {
    page.generateList();
    expect(page.markdownContent).toContain('<li');
    expect(page.markdownContent).toContain('Apple');
    expect(page.markdownContent).toContain('Banana');
    expect(page.markdownContent).toContain('Cherry');
  });

  it("Template expressions display counter value", function(done) {
    page.counter = 5;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('5');
      done();
    }, 100);
  });

  it("incrementCounter increases counter", function() {
    const initial = page.counter;
    page.incrementCounter();
    expect(page.counter).toBe(initial + 1);
  });

  it("calculatedValue getter returns correct value", function() {
    page.counter = 5;
    expect(page.calculatedValue).toBe(5 * 2 + 10);
    
    page.counter = 10;
    expect(page.calculatedValue).toBe(10 * 2 + 10);
  });

  it("formattedDate returns date string", function() {
    const date = page.formattedDate;
    expect(date).toBeDefined();
    expect(typeof date).toBe('string');
  });

  it("Template expressions with calculations", function(done) {
    page.counter = 3;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      // Should contain counter * 2 = 6
      expect(content).toContain('6');
      // Should contain counter + 100 = 103
      expect(content).toContain('103');
      done();
    }, 100);
  });

  it("Conditional expressions evaluate correctly", function(done) {
    page.counter = 4;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Yes'); // Even number
      done();
    }, 100);
  });

  it("userName expressions work", function(done) {
    page.userName = "Jane Smith";
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Jane Smith');
      expect(content).toContain('10'); // Length of "Jane Smith" is 10
      done();
    }, 100);
  });

  it("Array length expression", function(done) {
    page.items = ['A', 'B', 'C', 'D'];
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('4'); // Array length
      done();
    }, 100);
  });

  it("Array indexing expressions", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Apple'); // First item
      expect(content).toContain('Cherry'); // Last item
      done();
    }, 100);
  });

  it("Safe HTML renders without issues", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Safe HTML Content');
      done();
    }, 100);
  });

  it("Counter ternary expressions", function(done) {
    page.counter = 0;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Zero');
      done();
    }, 100);
  });

  it("Counter range expressions", function(done) {
    page.counter = 3;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Low');
      
      page.counter = 7;
      page.update();
      
      setTimeout(() => {
        const content2 = page.page.innerHTML;
        expect(content2).toContain('Medium');
        done();
      }, 100);
    }, 100);
  });

  it("JSON.stringify works in expressions", function(done) {
    page.items = ['Test1', 'Test2'];
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Test1');
      expect(content).toContain('Test2');
      done();
    }, 100);
  });

  it("String concatenation in expressions", function(done) {
    page.counter = 42;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Counter is: 42');
      done();
    }, 100);
  });

  it("Undefined properties handled gracefully", function(done) {
    page.update();
    
    setTimeout(() => {
      // Should not throw error even with nonExistentProperty
      const content = page.page.innerHTML;
      expect(content).toBeDefined();
      done();
    }, 100);
  });

  it("Null coalescing works", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('default value');
      done();
    }, 100);
  });

  it("Method calls in expressions work", function(done) {
    page.userName = "Test User";
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('TEST USER'); // toUpperCase()
      expect(content).toContain('Test'); // split(' ')[0]
      done();
    }, 100);
  });

  it("Complex JSON object in expressions", function(done) {
    page.counter = 10;
    page.userName = "Test";
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      // JSON.stringify should create valid JSON with the values
      expect(content).toContain('counter');
      expect(content).toContain('userName');
      expect(content).toContain('10');
      expect(content).toContain('Test');
      done();
    }, 150);
  });

  it("Items array is initialized correctly", function() {
    expect(page.items.length).toBe(3);
    expect(page.items[0]).toBe('Apple');
    expect(page.items[1]).toBe('Banana');
    expect(page.items[2]).toBe('Cherry');
  });

  it("HTML content can be completely replaced", function() {
    page.htmlContent = '<p>New content</p>';
    expect(page.htmlContent).toBe('<p>New content</p>');
  });

  it("Dynamic HTML can be set to complex structures", function() {
    page.dynamicHtml = '<div><span>Test</span></div>';
    expect(page.dynamicHtml).toContain('<span>Test</span>');
  });

  // ===== Conditional HTML Rendering Tests =====

  describe('Conditional HTML Rendering', function() {
    it("Conditional HTML properties initialized correctly", function() {
      expect(page.showConditionalHtml).toBe(true);
      expect(page.viewMode).toBe('card');
      expect(page.userRole).toBe('user');
      expect(page.statusType).toBe('success');
      expect(page.enableNestedCondition).toBe(true);
    });

    it("toggleConditionalHtml changes boolean state", function() {
      const initial = page.showConditionalHtml;
      page.toggleConditionalHtml();
      expect(page.showConditionalHtml).toBe(!initial);
      page.toggleConditionalHtml();
      expect(page.showConditionalHtml).toBe(initial);
    });

    it("conditionalHtml getter returns HTML when enabled", function() {
      page.showConditionalHtml = true;
      const html = page.conditionalHtml;
      expect(html).toContain('Conditional HTML is Active');
      expect(html).toContain('showConditionalHtml');
    });

    it("conditionalHtml getter returns empty string when disabled", function() {
      page.showConditionalHtml = false;
      const html = page.conditionalHtml;
      expect(html).toBe('');
    });

    it("conditionalHtml includes current counter and userName", function() {
      page.showConditionalHtml = true;
      page.counter = 42;
      page.userName = "Test User";
      const html = page.conditionalHtml;
      expect(html).toContain('42');
      expect(html).toContain('Test User');
    });

    it("setViewMode changes view mode", function() {
      page.setViewMode('list');
      expect(page.viewMode).toBe('list');
      page.setViewMode('compact');
      expect(page.viewMode).toBe('compact');
      page.setViewMode('card');
      expect(page.viewMode).toBe('card');
    });

    it("viewModeHtml returns card view HTML", function() {
      page.setViewMode('card');
      const html = page.viewModeHtml;
      expect(html).toContain('Card View');
      expect(html).toContain('📇');
    });

    it("viewModeHtml returns list view HTML", function() {
      page.setViewMode('list');
      const html = page.viewModeHtml;
      expect(html).toContain('List View');
      expect(html).toContain('📋');
      expect(html).toContain('<ul');
    });

    it("viewModeHtml returns compact view HTML", function() {
      page.setViewMode('compact');
      const html = page.viewModeHtml;
      expect(html).toContain('Compact:');
      expect(html).toContain('🔹');
    });

    it("viewModeHtml includes live data", function() {
      page.counter = 99;
      page.userName = "Live User";
      page.setViewMode('card');
      const html = page.viewModeHtml;
      expect(html).toContain('99');
      expect(html).toContain('Live User');
    });

    it("setUserRole changes user role", function() {
      page.setUserRole('admin');
      expect(page.userRole).toBe('admin');
      page.setUserRole('moderator');
      expect(page.userRole).toBe('moderator');
    });

    it("userRoleHtml returns admin HTML", function() {
      page.setUserRole('admin');
      const html = page.userRoleHtml;
      expect(html).toContain('Administrator Panel');
      expect(html).toContain('👑');
      expect(html).toContain('full access');
    });

    it("userRoleHtml returns moderator HTML", function() {
      page.setUserRole('moderator');
      const html = page.userRoleHtml;
      expect(html).toContain('Moderator Dashboard');
      expect(html).toContain('🛡️');
    });

    it("userRoleHtml returns user HTML", function() {
      page.setUserRole('user');
      const html = page.userRoleHtml;
      expect(html).toContain('User Dashboard');
      expect(html).toContain('👤');
    });

    it("userRoleHtml returns guest HTML for unknown role", function() {
      page.setUserRole('guest');
      const html = page.userRoleHtml;
      expect(html).toContain('Guest Access');
    });

    it("setStatusType changes status type", function() {
      page.setStatusType('error');
      expect(page.statusType).toBe('error');
      page.setStatusType('warning');
      expect(page.statusType).toBe('warning');
    });

    it("statusHtml returns success status", function() {
      page.setStatusType('success');
      const html = page.statusHtml;
      expect(html).toContain('Success');
      expect(html).toContain('✓');
      expect(html).toContain('completed successfully');
    });

    it("statusHtml returns warning status", function() {
      page.setStatusType('warning');
      const html = page.statusHtml;
      expect(html).toContain('Warning');
      expect(html).toContain('⚠');
    });

    it("statusHtml returns error status", function() {
      page.setStatusType('error');
      const html = page.statusHtml;
      expect(html).toContain('Error');
      expect(html).toContain('✗');
      expect(html).toContain('error occurred');
    });

    it("statusHtml returns info status", function() {
      page.setStatusType('info');
      const html = page.statusHtml;
      expect(html).toContain('Information');
      expect(html).toContain('ℹ');
    });

    it("statusHtml includes current data", function() {
      page.counter = 77;
      page.userName = "Status User";
      page.setStatusType('success');
      const html = page.statusHtml;
      expect(html).toContain('77');
      expect(html).toContain('Status User');
    });

    it("toggleNestedCondition changes state", function() {
      const initial = page.enableNestedCondition;
      page.toggleNestedCondition();
      expect(page.enableNestedCondition).toBe(!initial);
    });

    it("nestedConditionalHtml shows disabled message when false", function() {
      page.enableNestedCondition = false;
      const html = page.nestedConditionalHtml;
      expect(html).toContain('Nested condition is disabled');
    });

    it("nestedConditionalHtml shows nested content when enabled", function() {
      page.enableNestedCondition = true;
      const html = page.nestedConditionalHtml;
      expect(html).toContain('Nested Conditional Content');
      expect(html).toContain('enableNestedCondition');
    });

    it("nestedConditionalHtml shows counter > 5 message", function() {
      page.enableNestedCondition = true;
      page.counter = 10;
      const html = page.nestedConditionalHtml;
      expect(html).toContain('Counter is greater than 5');
      expect(html).toContain('10');
    });

    it("nestedConditionalHtml shows counter <= 5 message", function() {
      page.enableNestedCondition = true;
      page.counter = 3;
      const html = page.nestedConditionalHtml;
      expect(html).toContain('Counter is 5 or less');
      expect(html).toContain('3');
    });

    it("Conditional HTML renders in DOM when enabled", function(done) {
      page.showConditionalHtml = true;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Conditional HTML is Active');
        done();
      }, 100);
    });

    it("Conditional HTML is hidden when disabled", function(done) {
      page.showConditionalHtml = false;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Conditional HTML is hidden');
        done();
      }, 100);
    });

    it("View mode HTML renders in DOM", function(done) {
      page.setViewMode('list');
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('List View');
        done();
      }, 100);
    });

    it("User role HTML renders in DOM", function(done) {
      page.setUserRole('admin');
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Administrator Panel');
        done();
      }, 100);
    });

    it("Status HTML updates when status changes", function(done) {
      page.setStatusType('error');
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Error');
        
        page.setStatusType('success');
        page.update();
        
        setTimeout(() => {
          const content2 = page.page.innerHTML;
          expect(content2).toContain('Success');
          done();
        }, 100);
      }, 100);
    });

    it("Nested conditional HTML updates reactively", function(done) {
      page.enableNestedCondition = true;
      page.counter = 3;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Counter is 5 or less');
        
        page.counter = 8;
        page.update();
        
        setTimeout(() => {
          const content2 = page.page.innerHTML;
          expect(content2).toContain('Counter is greater than 5');
          done();
        }, 100);
      }, 100);
    });

    it("Multiple conditional HTML sections can coexist", function(done) {
      page.showConditionalHtml = true;
      page.setViewMode('card');
      page.setUserRole('moderator');
      page.setStatusType('warning');
      page.enableNestedCondition = true;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Conditional HTML is Active');
        expect(content).toContain('Card View');
        expect(content).toContain('Moderator Dashboard');
        expect(content).toContain('Warning');
        expect(content).toContain('Nested Conditional Content');
        done();
      }, 150);
    });

    it("[if] and [html] on same element - renders when condition true", function(done) {
      page.showConditionalHtml = true;
      page.setStatusType('success');
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Success');
        expect(content).toContain('Operation completed successfully');
        done();
      }, 100);
    });

    it("[if] and [html] on same element - element removed when condition false", function(done) {
      page.showConditionalHtml = false;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Element removed from DOM');
        done();
      }, 100);
    });

    it("[if] and [html] on same element - content updates when status changes", function(done) {
      page.showConditionalHtml = true;
      page.setStatusType('error');
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('error occurred');
        
        page.setStatusType('warning');
        page.update();
        
        setTimeout(() => {
          const content2 = page.page.innerHTML;
          expect(content2).toContain('Warning');
          expect(content2).toContain('Please review the following information');
          expect(content2).not.toContain('error occurred');
          done();
        }, 100);
      }, 100);
    });

    it("[if] and [html] on same element - toggles between showing and hiding", function(done) {
      page.showConditionalHtml = true;
      page.setStatusType('info');
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('Information');
        
        page.toggleConditionalHtml();
        page.update();
        
        setTimeout(() => {
          const content2 = page.page.innerHTML;
          expect(content2).toContain('Element removed from DOM');
          
          page.toggleConditionalHtml();
          page.update();
          
          setTimeout(() => {
            const content3 = page.page.innerHTML;
            expect(content3).toContain('Information');
            done();
          }, 100);
        }, 100);
      }, 100);
    });
  });
});
