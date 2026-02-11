// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';
import { TestTransitionsPage } from '../../test/Pages/TestTransitionsPage';

const I= Injector;


I.Nav = new NavController();
let page: TestTransitionsPage;

describe('Test TestTransitionsPage - [transition] directive', function() {
  beforeEach(function(done) {
    page = I.Nav.push(TestTransitionsPage);
    done();
  });

  afterEach(function(done) {
      page.destroy();
    done();
  });

  it("Page defined and initialized with default values", function() {
    expect(page).not.toBeNull();
    expect(page.fadeCounter).toBe(0);
    expect(page.slideCounter).toBe(0);
    expect(page.scaleCounter).toBe(0);
    expect(page.rotateCounter).toBe(0);
    expect(page.currentView).toBe(1);
    expect(page.imageIndex).toBe(0);
  });

  it("nextFade increments fade counter", function() {
    const initial = page.fadeCounter;
    page.nextFade();
    expect(page.fadeCounter).toBe(initial + 1);
  });

  it("nextSlide increments slide counter", function() {
    const initial = page.slideCounter;
    page.nextSlide();
    expect(page.slideCounter).toBe(initial + 1);
  });

  it("nextScale increments scale counter", function() {
    const initial = page.scaleCounter;
    page.nextScale();
    expect(page.scaleCounter).toBe(initial + 1);
  });

  it("nextRotate increments rotate counter", function() {
    const initial = page.rotateCounter;
    page.nextRotate();
    expect(page.rotateCounter).toBe(initial + 1);
  });

  it("switchView changes current view", function() {
    page.switchView(2);
    expect(page.currentView).toBe(2);
    
    page.switchView(3);
    expect(page.currentView).toBe(3);
    
    page.switchView(1);
    expect(page.currentView).toBe(1);
  });

  it("nextImage cycles through images", function() {
    expect(page.imageIndex).toBe(0);
    
    page.nextImage();
    expect(page.imageIndex).toBe(1);
    
    page.nextImage();
    expect(page.imageIndex).toBe(2);
    
    page.nextImage();
    expect(page.imageIndex).toBe(0); // Cycles back
  });

  it("previousImage cycles backward through images", function() {
    expect(page.imageIndex).toBe(0);
    
    page.previousImage();
    expect(page.imageIndex).toBe(2); // Wraps to end
    
    page.previousImage();
    expect(page.imageIndex).toBe(1);
    
    page.previousImage();
    expect(page.imageIndex).toBe(0);
  });

  it("Transition content displays counter value", function(done) {
    page.fadeCounter = 5;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('5');
      done();
    }, 100);
  });

  it("View switcher displays correct view", function(done) {
    page.currentView = 1;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('View 1');
      done();
    }, 100);
  });

  it("View switcher switches views", function(done) {
    page.currentView = 2;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('View 2');
      done();
    }, 100);
  });

  it("Image carousel displays current image", function(done) {
    page.imageIndex = 0;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Image 1');
      done();
    }, 100);
  });

  it("Image carousel updates when index changes", function(done) {
    page.imageIndex = 1;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Image 2');
      done();
    }, 100);
  });

  it("Multiple counters update independently", function() {
    page.fadeCounter = 5;
    page.slideCounter = 10;
    page.scaleCounter = 15;
    
    expect(page.fadeCounter).toBe(5);
    expect(page.slideCounter).toBe(10);
    expect(page.scaleCounter).toBe(15);
  });

  it("All view options can be selected", function() {
    [1, 2, 3, 4].forEach(view => {
      page.switchView(view);
      expect(page.currentView).toBe(view);
    });
  });

  it("Fade transition content updates on counter change", function(done) {
    page.fadeCounter = 0;
    page.update();
    
    setTimeout(() => {
      page.fadeCounter = 1;
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain('1');
        done();
      }, 100);
    }, 100);
  });

  it("CSS transition classes are defined in template", function(done) {
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('fade-enter');
      expect(content).toContain('slide-enter');
      expect(content).toContain('scale-enter');
      expect(content).toContain('rotate-enter');
      done();
    }, 100);
  });

  it("Transition configuration documentation is present", function(done) {
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Transition Options');
      expect(content).toContain('trigger');
      expect(content).toContain('duration');
      done();
    }, 100);
  });

  it("Performance tips are displayed", function(done) {
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Performance Tips');
      done();
    }, 100);
  });

  it("Image carousel shows correct count", function(done) {
    page.imageIndex = 1;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Image 2 of 3');
      done();
    }, 100);
  });

  it("All transition counters start at zero", function() {
    const newPage = new TestTransitionsPage();
    expect(newPage.fadeCounter).toBe(0);
    expect(newPage.slideCounter).toBe(0);
    expect(newPage.scaleCounter).toBe(0);
    expect(newPage.rotateCounter).toBe(0);
    expect(newPage.customCounter).toBe(0);
  });

  it("Multiple consecutive increments work", function() {
    page.nextFade();
    page.nextFade();
    page.nextFade();
    expect(page.fadeCounter).toBe(3);
  });

  it("Image navigation handles edge cases", function() {
    page.imageIndex = 0;
    page.previousImage();
    expect(page.imageIndex).toBe(2);
    
    page.imageIndex = 2;
    page.nextImage();
    expect(page.imageIndex).toBe(0);
  });

  it("View content changes based on currentView", function(done) {
    const views = [1, 2, 3, 4];
    let completed = 0;
    
    views.forEach((view, index) => {
      page.switchView(view);
      page.update();
      
      setTimeout(() => {
        const content = page.page.innerHTML;
        expect(content).toContain(`View ${view}`);
        completed++;
        if (completed === views.length) {
          done();
        }
      }, 100 * (index + 1));
    });
  });
});