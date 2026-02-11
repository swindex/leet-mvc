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
      page.update();
      done();
    }, 50);
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
});