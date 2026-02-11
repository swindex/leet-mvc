// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';
import { TestDirectivesPage } from '../../test/Pages/TestDirectivesPage';

const I= Injector;


I.Nav = new NavController();
let page: TestDirectivesPage;

describe('Test TestDirectivesPage - [if], [show], [display] directives', function() {
  beforeEach(function(done) {
    page = I.Nav.push(TestDirectivesPage);
    setTimeout(() => {
      page.update();
      done();
    }, 50);
  });

  afterEach(function(done) {
    page.destroy();
    done();
  });

  it("Page defined and initialized", function() {
    expect(page).not.toBeNull();
    expect(page.showSection1).toBe(true);
    expect(page.showSection2).toBe(false);
    expect(page.ifCondition).toBe(true);
    expect(page.numberValue).toBe(5);
  });

  it("[if] directive shows content when condition is true", function(done) {
    expect(page.ifCondition).toBe(true);
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('This content is conditionally rendered with [if]');
      expect(content).not.toContain('Condition is false - alternative content');
      done();
    }, 100);
  });

  it("[if] directive hides content when condition is false", function(done) {
    page.ifCondition = false;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).not.toContain('This content is conditionally rendered with [if]');
      expect(content).toContain('Condition is false - alternative content');
      done();
    }, 100);
  });

  it("[if] directive with expressions - greater than", function(done) {
    page.numberValue = 10;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Number is greater than 5!');
      expect(content).not.toContain('Number equals 5!');
      expect(content).not.toContain('Number is less than 5!');
      done();
    }, 100);
  });

  it("[if] directive with expressions - equals", function(done) {
    page.numberValue = 5;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).not.toContain('Number is greater than 5!');
      expect(content).toContain('Number equals 5!');
      expect(content).not.toContain('Number is less than 5!');
      done();
    }, 100);
  });

  it("[if] directive with expressions - less than", function(done) {
    page.numberValue = 3;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).not.toContain('Number is greater than 5!');
      expect(content).not.toContain('Number equals 5!');
      expect(content).toContain('Number is less than 5!');
      done();
    }, 100);
  });

  it("[if] directive with truthy values", function(done) {
    page.truthyValue = "hello";
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Value is truthy');
      expect(content).not.toContain('Value is falsy');
      done();
    }, 100);
  });

  it("[if] directive with falsy values", function(done) {
    page.truthyValue = null;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).not.toContain('Value is truthy');
      expect(content).toContain('Value is falsy');
      done();
    }, 100);
  });

  it("[show] directive shows element by default", function(done) {
    expect(page.showSection1).toBe(true);
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      // Section 1 should be visible (not display:none)
      expect(content).toContain('Section 1');
      done();
    }, 100);
  });

  it("[show] directive hides element when false", function(done) {
    page.showSection1 = false;
    page.update();
    
    setTimeout(() => {
      // The [show] directive should set display: none
      const content = page.page.innerHTML;
      // Content should still be in DOM but hidden
      expect(content).toContain('Section 1');
      done();
    }, 100);
  });

  it("[display] directive changes display property", function(done) {
    page.displayValue = "flex";
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('flex');
      done();
    }, 100);
  });

  it("Nested [if] conditions - both true", function(done) {
    page.ifCondition = true;
    page.nestedCondition = true;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Outer condition is TRUE');
      expect(content).toContain('Inner condition is TRUE');
      expect(content).toContain('Both conditions must be true to see this!');
      done();
    }, 100);
  });

  it("Nested [if] conditions - outer true, inner false", function(done) {
    page.ifCondition = true;
    page.nestedCondition = false;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Outer condition is TRUE');
      expect(content).not.toContain('Inner condition is TRUE');
      expect(content).toContain('Inner condition is FALSE');
      done();
    }, 100);
  });

  it("Nested [if] conditions - outer false", function(done) {
    page.ifCondition = false;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).not.toContain('Outer condition is TRUE');
      expect(content).not.toContain('Inner condition is TRUE');
      done();
    }, 100);
  });

  it("Toggle methods work correctly", function() {
    const initialShow1 = page.showSection1;
    page.toggleShow1();
    expect(page.showSection1).toBe(!initialShow1);

    const initialShow2 = page.showSection2;
    page.toggleShow2();
    expect(page.showSection2).toBe(!initialShow2);

    const initialIf = page.ifCondition;
    page.toggleIf();
    expect(page.ifCondition).toBe(!initialIf);
  });

  it("Number increment/decrement works", function() {
    const initial = page.numberValue;
    page.incrementNumber();
    expect(page.numberValue).toBe(initial + 1);
    
    page.decrementNumber();
    expect(page.numberValue).toBe(initial);
  });

  it("Display value setter works", function() {
    page.setDisplay('inline-block');
    expect(page.displayValue).toBe('inline-block');
    
    page.setDisplay('none');
    expect(page.displayValue).toBe('none');
  });
});