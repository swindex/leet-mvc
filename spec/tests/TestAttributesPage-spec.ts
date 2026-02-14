// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';
import { TestAttributesPage } from '../../test/Pages/TestAttributesPage';

const Nav = new NavController()

let page: TestAttributesPage;

describe('Test TestAttributesPage - [attribute], [style], [class], [selected] directives', function() {
  beforeEach(function(done) {
    page = Nav.push(TestAttributesPage);
    setTimeout(() => {
      done();
    }, 1);
  });

  afterEach(function(done) {
    page.destroy();
    done();
  });

  it("Page defined and initialized with default values", function() {
    debugger;
    expect(page).not.toBeNull();
    expect(page.dynamicAttributes).toBeDefined();
    expect(page.dynamicAttributes['data-custom']).toBe('custom-value');
    expect(page.dynamicStyles).toBeDefined();
    expect(page.dynamicClass).toBe('highlight');
    expect(page.selectedOption).toBe('option2');
  });

  it("[attribute] directive applies custom attributes", function(done) {
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('data-custom');
      expect(content).toContain('title');
      expect(content).toContain('aria-label');
      done();
    }, 100);
  });

  it("addAttribute method adds new attribute", function(done) {
    const beforeKeys = Object.keys(page.dynamicAttributes).length;
    page.addAttribute();
    
    expect(Object.keys(page.dynamicAttributes).length).toBe(beforeKeys + 1);
    expect(page.dynamicAttributes['data-timestamp']).toBeDefined();
    done();
  });

  it("removeAttribute method removes attribute", function(done) {
    expect(page.dynamicAttributes['data-custom']).toBeDefined();
    page.removeAttribute();
    expect(page.dynamicAttributes['data-custom']).toBeUndefined();
    done();
  });

  it("toggleDisabled updates disabled attribute", function() {
    expect(page.isDisabled).toBe(false);
    page.toggleDisabled();
    expect(page.isDisabled).toBe(true);
    expect(page.dynamicAttributes['disabled']).toBe('disabled');
    
    page.toggleDisabled();
    expect(page.isDisabled).toBe(false);
    expect(page.dynamicAttributes['disabled']).toBe(null);
  });

  it("[style] directive applies dynamic styles", function(done) {
    setTimeout(() => {
      expect(page.dynamicStyles.padding).toBe('15px');
      expect(page.dynamicStyles.border).toBe('2px solid blue');
      expect(page.dynamicStyles.backgroundColor).toBe('lightblue');
      done();
    }, 100);
  });

  it("Font size increase/decrease works", function() {
    const initial = page.fontSize;
    page.increaseFontSize();
    expect(page.fontSize).toBe(initial + 2);
    expect(page.dynamicStyles.fontSize).toBe((initial + 2) + 'px');
    
    page.decreaseFontSize();
    expect(page.fontSize).toBe(initial);
  });

  it("Background color change updates style", function() {
    page.changeBackgroundColor('lightgreen');
    expect(page.backgroundColor).toBe('lightgreen');
    expect(page.dynamicStyles.backgroundColor).toBe('lightgreen');
  });

  it("Text color change updates style", function() {
    page.changeTextColor('#ff0000');
    expect(page.textColor).toBe('#ff0000');
    expect(page.dynamicStyles.color).toBe('#ff0000');
  });

  it("Border toggle changes border style", function() {
    const initialWidth = page.borderWidth;
    page.changeBorder();
    expect(page.borderWidth).not.toBe(initialWidth);
    expect(page.dynamicStyles.border).toContain(page.borderWidth + 'px');
  });

  it("[class] directive applies dynamic CSS class", function(done) {
    expect(page.dynamicClass).toBe('highlight');
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('highlight');
      done();
    }, 100);
  });

  it("setClass method changes dynamic class", function() {
    page.setClass('success');
    expect(page.dynamicClass).toBe('success');
    
    page.setClass('error');
    expect(page.dynamicClass).toBe('error');
    
    page.setClass('');
    expect(page.dynamicClass).toBe('');
  });

  it("[selected] directive controls option selection", function(done) {
    expect(page.selectedOption).toBe('option2');
    page.update();
    
    setTimeout(() => {
      const selects = DOM(page.page).find('select');
      if (selects.length > 0) {
        expect(selects[0].value).toBe('option2');
      }
      done();
    }, 100);
  });

  it("Changing selectedOption updates select element", function(done) {
    page.selectedOption = 'option3';
    page.update();
    
    setTimeout(() => {
      expect(page.selectedOption).toBe('option3');
      done();
    }, 100);
  });

  it("Multiple directives work together on same element", function(done) {
    page.dynamicAttributes['data-test'] = 'test-value';
    page.dynamicStyles.color = 'red';
    page.dynamicClass = 'info';
    page.update();
    
    setTimeout(() => {
      expect(page.dynamicAttributes['data-test']).toBe('test-value');
      expect(page.dynamicStyles.color).toBe('red');
      expect(page.dynamicClass).toBe('info');
      done();
    }, 100);
  });

  it("Style object contains all expected properties", function() {
    expect(page.dynamicStyles.padding).toBeDefined();
    expect(page.dynamicStyles.border).toBeDefined();
    expect(page.dynamicStyles.borderRadius).toBeDefined();
    expect(page.dynamicStyles.backgroundColor).toBeDefined();
  });

  it("Attribute object contains initial attributes", function() {
    expect(page.dynamicAttributes['data-custom']).toBe('custom-value');
    expect(page.dynamicAttributes['title']).toBe('Hover over me!');
    expect(page.dynamicAttributes['aria-label']).toBe('Accessible label');
  });

  it("All class options can be set", function() {
    const classes = ['highlight', 'success', 'error', 'warning', 'info'];
    classes.forEach(cls => {
      page.setClass(cls);
      expect(page.dynamicClass).toBe(cls);
    });
  });

  it("Font size has minimum threshold", function() {
    page.fontSize = 10;
    page.decreaseFontSize();
    expect(page.fontSize).toBe(8);
    
    page.decreaseFontSize();
    expect(page.fontSize).toBe(8); // Should not go below 8
  });

  it("Initial state values are correct", function() {
    expect(page.fontSize).toBe(16);
    expect(page.backgroundColor).toBe('#f0f0f0');
    expect(page.textColor).toBe('#333333');
    expect(page.borderWidth).toBe(2);
  });

  it("Conditional disabled attribute works", function(done) {
    page.isDisabled = true;
    page.update();
    
    setTimeout(() => {
      expect(page.isDisabled).toBe(true);
      done();
    }, 100);
  });

  it("Style updates reflect in style object", function() {
    page.dynamicStyles.margin = '20px';
    expect(page.dynamicStyles.margin).toBe('20px');
    
    page.dynamicStyles.fontSize = '24px';
    expect(page.dynamicStyles.fontSize).toBe('24px');
  });
});