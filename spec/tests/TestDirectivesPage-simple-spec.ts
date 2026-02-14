// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { TestDirectivesPage } from '../../test/Pages/TestDirectivesPage';

const I= Injector;


I.Nav = new NavController();
let page: TestDirectivesPage;

describe('Test TestDirectivesPage - Simple verification', function() {
  beforeEach(function(done) {
    page = I.Nav.push(TestDirectivesPage);
    setTimeout(() => {
      done();
    }, 1);
  });

  afterEach(function(done) {
    page.destroy();
    done();
  });

  it("Page loads and initializes", function(done) {
    setTimeout(() => {
      expect(page).not.toBeNull();
      expect(page.showSection1).toBe(true);
      expect(page.showSection2).toBe(false);
      expect(page.ifCondition).toBe(true);
      expect(page.numberValue).toBe(5);
      done();
    }, 100);
  });

  it("Page content renders", function(done) {
    setTimeout(() => {
      expect(page.page).toBeDefined();
      expect(page.page.innerHTML).toBeDefined();
      const content = page.page.innerHTML;
      expect(content.length).toBeGreaterThan(0);
      done();
    }, 100);
  });

  it("[if] directive renders correctly", function(done) {
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('conditionally rendered');
      done();
    }, 100);
  });
});