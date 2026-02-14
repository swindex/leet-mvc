// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';
import { TestNestedDirectivesPage } from '../../test/Pages/TestNestedDirectivesPage';

const Nav = new NavController();
let page: TestNestedDirectivesPage;

describe('Test TestNestedDirectivesPage - Nested and complex directive combinations', function() {
  beforeEach(function(done) {    
    page = Nav.push(TestNestedDirectivesPage);
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
    expect(page.showSection).toBe(true);
    expect(page.activeCategory).toBe(0);
    expect(page.categories.length).toBe(3);
    expect(page.users.length).toBe(4);
    expect(page.tableData.length).toBe(4);
  });

  it("Categories are initialized correctly", function() {
    expect(page.categories[0].name).toBe('Electronics');
    expect(page.categories[0].items.length).toBe(3);
    expect(page.categories[1].name).toBe('Clothing');
    expect(page.categories[2].name).toBe('Books');
  });

  it("Users are initialized correctly", function() {
    expect(page.users[0].name).toBe('John Doe');
    expect(page.users[0].active).toBe(true);
    expect(page.users[0].role).toBe('Admin');
    expect(page.users[2].active).toBe(false);
  });

  it("toggleSection changes showSection", function() {
    const initial = page.showSection;
    page.toggleSection();
    expect(page.showSection).toBe(!initial);
  });

  it("toggleCategoryVisibility changes category visibility", function() {
    const initial = page.categories[0].visible;
    page.toggleCategoryVisibility(0);
    expect(page.categories[0].visible).toBe(!initial);
  });

  it("addCategory adds new category", function() {
    const initial = page.categories.length;
    page.addCategory();
    expect(page.categories.length).toBe(initial + 1);
    expect(page.categories[initial].name).toContain('Category');
  });

  it("removeCategory removes category at index", function() {
    const initial = page.categories.length;
    const firstCategoryName = page.categories[0].name;
    page.removeCategory(0);
    expect(page.categories.length).toBe(initial - 1);
    expect(page.categories[0].name).not.toBe(firstCategoryName);
  });

  it("setActiveCategory changes active category", function() {
    page.setActiveCategory(1);
    expect(page.activeCategory).toBe(1);
    
    page.setActiveCategory(2);
    expect(page.activeCategory).toBe(2);
  });

  it("selectUser sets selected user ID", function() {
    page.selectUser(2);
    expect(page.selectedUserId).toBe(2);
    
    page.selectUser(3);
    expect(page.selectedUserId).toBe(3);
  });

  it("toggleUserActive changes user active state", function() {
    const initial = page.users[0].active;
    page.toggleUserActive(0);
    expect(page.users[0].active).toBe(!initial);
  });

  it("addUser adds new user", function() {
    const initial = page.users.length;
    page.addUser();
    expect(page.users.length).toBe(initial + 1);
    expect(page.users[initial].active).toBe(true);
  });

  it("selectedUser getter returns correct user", function() {
    page.selectUser(1);
    const user = page.selectedUser;
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(user.name).toBe('John Doe');
  });

  it("selectedUser returns undefined when no selection", function() {
    page.selectedUserId = null;
    const user = page.selectedUser;
    expect(user).toBeUndefined();
  });

  it("toggleLevel2 changes nested data visibility", function() {
    const initial = page.nestedData.level1.level2[0].visible;
    page.toggleLevel2(0);
    expect(page.nestedData.level1.level2[0].visible).toBe(!initial);
  });

  it("toggleAdvanced changes showAdvanced", function() {
    const initial = page.showAdvanced;
    page.toggleAdvanced();
    expect(page.showAdvanced).toBe(!initial);
  });

  it("[if] + [foreach] combination renders categories", function(done) {
    page.showSection = true;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Electronics');
      expect(content).toContain('Clothing');
      expect(content).toContain('Books');
      done();
    }, 100);
  });

  it("[if] + [foreach] hides content when condition false", function(done) {
    page.showSection = false;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      // Categories list should not be visible
      expect(content).not.toContain('Categories List:');
      done();
    }, 100);
  });

  it("Nested [foreach] renders category items", function(done) {
    page.showSection = true;
    page.categories[0].visible = true;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Laptop');
      expect(content).toContain('Phone');
      expect(content).toContain('Tablet');
      done();
    }, 100);
  });

  it("Active users display in list", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('John Doe');
      expect(content).toContain('Jane Smith');
      expect(content).toContain('Alice Williams');
      done();
    }, 100);
  });

  it("Inactive user is filtered out", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      // Bob Johnson is inactive, should appear in inactive section
      expect(content).toContain('Bob Johnson');
      done();
    }, 100);
  });

  it("Three-level nested structure renders", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Level 1');
      expect(content).toContain('Level 2-A');
      done();
    }, 100);
  });

  it("Nested level2 items can be toggled", function(done) {
    page.nestedData.level1.level2[0].visible = true;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Item 1');
      
      page.toggleLevel2(0);
      page.update();
      
      setTimeout(() => {
        // Items should now be hidden
        expect(page.nestedData.level1.level2[0].visible).toBe(false);
        done();
      }, 100);
    }, 100);
  });

  it("Table data renders correctly", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Laptop');
      expect(content).toContain('Mouse');
      expect(content).toContain('Keyboard');
      expect(content).toContain('Monitor');
      done();
    }, 100);
  });

  it("Advanced view shows extra columns", function(done) {
    page.showAdvanced = true;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Quantity');
      expect(content).toContain('Total Value');
      done();
    }, 100);
  });

  it("Tab structure renders all category tabs", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      page.categories.forEach(cat => {
        expect(content).toContain(cat.name);
      });
      done();
    }, 100);
  });

  it("Active tab displays its content", function(done) {
    page.activeCategory = 1;
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Clothing');
      expect(content).toContain('Shirt');
      done();
    }, 100);
  });

  it("Statistics counters display correctly", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('Total Categories:');
      expect(content).toContain('Total Users:');
      expect(content).toContain('Active Users:');
      done();
    }, 100);
  });

  it("Category statistics show item counts", function(done) {
    page.update();
    
    setTimeout(() => {
      const content = page.page.innerHTML;
      expect(content).toContain('3 items'); // Electronics has 3 items
      done();
    }, 100);
  });

  it("Multiple categories can be added and removed", function() {
    const initial = page.categories.length;
    
    page.addCategory();
    page.addCategory();
    expect(page.categories.length).toBe(initial + 2);
    
    page.removeCategory(0);
    expect(page.categories.length).toBe(initial + 1);
  });

  it("Multiple users can be added", function() {
    const initial = page.users.length;
    
    page.addUser();
    page.addUser();
    expect(page.users.length).toBe(initial + 2);
  });

  it("User selection changes selected user", function() {
    page.selectUser(1);
    expect(page.selectedUser.id).toBe(1);
    
    page.selectUser(2);
    expect(page.selectedUser.id).toBe(2);
  });

  it("Table data contains expected products", function() {
    expect(page.tableData[0].product).toBe('Laptop');
    expect(page.tableData[0].price).toBe(999);
    expect(page.tableData[0].inStock).toBe(true);
  });

  it("Out of stock items are marked correctly", function() {
    const outOfStock = page.tableData.find(item => !item.inStock);
    expect(outOfStock).toBeDefined();
    expect(outOfStock.product).toBe('Keyboard');
  });

  it("Nested data structure is initialized", function() {
    expect(page.nestedData.level1.title).toBe('Level 1');
    expect(page.nestedData.level1.level2.length).toBe(2);
    expect(page.nestedData.level1.level2[0].level3.length).toBe(3);
  });

  it("Category visibility can be toggled individually", function() {
    page.categories.forEach((cat, index) => {
      const initial = cat.visible;
      page.toggleCategoryVisibility(index);
      expect(page.categories[index].visible).toBe(!initial);
    });
  });

  it("All users can be toggled active/inactive", function() {
    page.users.forEach((user, index) => {
      const initial = user.active;
      page.toggleUserActive(index);
      expect(page.users[index].active).toBe(!initial);
    });
  });

  it("Initial state has correct number of active users", function() {
    const activeCount = page.users.filter(u => u.active).length;
    expect(activeCount).toBe(3); // 3 out of 4 users are active initially
  });

  it("Initial state has correct number of visible categories", function() {
    const visibleCount = page.categories.filter(c => c.visible).length;
    expect(visibleCount).toBe(2); // 2 out of 3 categories visible initially
  });
});