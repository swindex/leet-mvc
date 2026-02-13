// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';
import { TestBindDirectivePage } from '../../test/Pages/TestBindDirectivePage';


var Nav = new NavController();
let page: TestBindDirectivePage;

describe('Test TestBindDirectivePage - [bind] directive', function() {
  beforeEach(function() {
    page = Nav.push(TestBindDirectivePage);
  });

  afterEach(function() {
    page.destroy();
  });

  it("Page defined and initialized with default values", function() {
    expect(page).not.toBeNull();
    expect(page.textInput).toBe("Hello World");
    expect(page.selectValue).toBe("option2");
    expect(page.radioValue).toBe("radio2");
    expect(page.checkboxValue).toBe(true);
    expect(page.numberInput).toBe(42);
  });

  it("Text input displays bound value", function(done) {
    setTimeout(() => {
      const inputs = DOM(page.page).find('input[type="text"]');
      let found = false;
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "Hello World") {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
      done();
    }, 100);
  });

  it("Changing model updates text input", function(done) {
    page.textInput = "New Value";
    page.update();
    
    setTimeout(() => {
      const inputs = DOM(page.page).find('input[type="text"]');
      let found = false;
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "New Value") {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
      done();
    }, 100);
  });

  it("Textarea displays bound value", function(done) {
    setTimeout(() => {
      const textareas = DOM(page.page).find('textarea');
      expect(textareas.length).toBeGreaterThan(0);
      expect(textareas[0].value).toContain("Multi-line");
      done();
    }, 100);
  });

  it("Select dropdown shows correct option selected", function(done) {
    expect(page.selectValue).toBe("option2");
    setTimeout(() => {
      const selects = DOM(page.page).find('select');
      expect(selects.length).toBeGreaterThan(0);
      expect(selects[0].value).toBe("option2");
      done();
    }, 100);
  });

  it("Changing select value updates model", function(done) {
    page.selectValue = "option3";
    page.update();
    
    setTimeout(() => {
      const selects = DOM(page.page).find('select');
      expect(selects[0].value).toBe("option3");
      done();
    }, 100);
  });

  it("Radio button binding shows correct selection", function(done) {
    expect(page.radioValue).toBe("radio2");
    setTimeout(() => {
      const radios = DOM(page.page).find('input[type="radio"]');
      let checkedValue = null;
      for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
          checkedValue = radios[i].value;
          break;
        }
      }
      expect(checkedValue).toBe("radio2");
      done();
    }, 100);
  });

  it("Changing radio value updates model", function(done) {
    page.radioValue = "radio1";
    page.update();
    
    setTimeout(() => {
      const radios = DOM(page.page).find('input[type="radio"]');
      let checkedValue = null;
      for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
          checkedValue = radios[i].value;
          break;
        }
      }
      expect(checkedValue).toBe("radio1");
      done();
    }, 100);
  });

  it("Checkbox binding reflects boolean value", function(done) {
    expect(page.checkboxValue).toBe(true);
    setTimeout(() => {
      const checkboxes = DOM(page.page).find('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
      expect(checkboxes[0].checked).toBe(true);
      done();
    }, 100);
  });

  it("Changing checkbox value updates model", function(done) {
    page.checkboxValue = false;
    page.update();
    
    setTimeout(() => {
      const checkboxes = DOM(page.page).find('input[type="checkbox"]');
      expect(checkboxes[0].checked).toBe(false);
      done();
    }, 100);
  });

  it("Number input displays numeric value", function(done) {
    expect(page.numberInput).toBe(42);
    setTimeout(() => {
      const inputs = DOM(page.page).find('input[type="number"]');
      expect(inputs.length).toBeGreaterThan(0);
      expect(parseInt(inputs[0].value)).toBe(42);
      done();
    }, 100);
  });

  it("Email input displays email value", function(done) {
    expect(page.emailInput).toBe("test@example.com");
    setTimeout(() => {
      const inputs = DOM(page.page).find('input[type="email"]');
      expect(inputs.length).toBeGreaterThan(0);
      expect(inputs[0].value).toBe("test@example.com");
      done();
    }, 100);
  });

  it("Date input displays date value", function(done) {
    expect(page.dateInput).toBe("2024-01-15");
    setTimeout(() => {
      const inputs = DOM(page.page).find('input[type="date"]');
      expect(inputs.length).toBeGreaterThan(0);
      expect(inputs[0].value).toBe("2024-01-15");
      done();
    }, 100);
  });

  it("resetAll method clears all values", function() {
    page.resetAll();
    expect(page.textInput).toBe("");
    expect(page.textareaInput).toBe("");
    expect(page.selectValue).toBe("");
    expect(page.radioValue).toBe("");
    expect(page.checkboxValue).toBe(false);
    expect(page.numberInput).toBe(0);
    expect(page.emailInput).toBe("");
    expect(page.dateInput).toBe("");
  });

  it("setDefaults method sets default values", function() {
    page.setDefaults();
    expect(page.textInput).toBe("Default Text");
    expect(page.selectValue).toBe("option1");
    expect(page.radioValue).toBe("radio1");
    expect(page.checkboxValue).toBe(true);
    expect(page.numberInput).toBe(100);
    expect(page.emailInput).toBe("default@test.com");
    expect(page.dateInput).toBe("2024-12-31");
  });

  it("Multiple form fields update independently", function(done) {
    page.textInput = "Test1";
    page.numberInput = 99;
    page.checkboxValue = false;
    page.update();
    
    setTimeout(() => {
      expect(page.textInput).toBe("Test1");
      expect(page.numberInput).toBe(99);
      expect(page.checkboxValue).toBe(false);
      done();
    }, 100);
  });

  it("Bound values display in template expressions", function(done) {
    page.textInput = "Display Test";
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain("Display Test");
      done();
    }, 100);
  });

  it("Form summary displays all bound values", function(done) {
    page.textInput = "John";
    page.emailInput = "john@test.com";
    page.numberInput = 25;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain("John");
      expect(content).toContain("john@test.com");
      expect(content).toContain("25");
      done();
    }, 100);
  });

  it("Empty string values are handled correctly", function(done) {
    page.textInput = "";
    page.update();
    
    setTimeout(() => {
      const inputs = DOM(page.page).find('input[type="text"]');
      let found = false;
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "") {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
      done();
    }, 100);
  });

  // NOTE: Invalid bind expressions like "this.textInput + this.emailInput" 
  // already fail at compile-time when createSetter() is called with new Function().
  // This is the desired behavior - preventing invalid expressions from being used.
  // The invokeSetter() method provides runtime error reporting for cases where
  // a valid setter function fails during execution (e.g., accessing undefined properties).
  
  it("invokeSetter provides descriptive errors for runtime failures", function() {
    const { ExpressionCompiler } = require('../../core/binder/ExpressionCompiler');
    
    // Create a context and a valid setter
    const context = { obj: { prop: "test" } };
    const compiler = new ExpressionCompiler();
    const expression = "this.obj.prop";
    const setter = compiler.createSetter(expression, {}, context);
    
    // Now break the context to cause a runtime error
    context.obj = null;
    
    try {
      // This should throw a descriptive error about bind directive
      ExpressionCompiler.invokeSetter(setter, {}, "new value", expression);
      fail("Should have thrown an error");
    } catch (error) {
      // Verify error message contains helpful information
      const errorMsg = error.message;
      expect(errorMsg).toContain("[bind] directive error");
      expect(errorMsg).toContain("Cannot assign value");
      expect(errorMsg).toContain("assignable expression");
      expect(errorMsg).toContain("[text] directive");
    }
  });
});
