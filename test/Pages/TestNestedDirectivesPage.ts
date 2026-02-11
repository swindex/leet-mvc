// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from "../../components/BaseComponent";

export class TestNestedDirectivesPage extends HeaderPage {
  showSection: boolean;
  categories: any[];
  activeCategory: number;
  users: any[] = [];
  selectedUserId: number;
  nestedData: any;
  tableData: any[];
  showAdvanced: boolean;

  constructor() {
    super();
    
    this.showSection = true;
    this.activeCategory = 0;
    this.selectedUserId = null;
    this.showAdvanced = false;
    
    this.categories = [
      { 
        id: 1, 
        name: 'Electronics', 
        visible: true,
        items: ['Laptop', 'Phone', 'Tablet']
      },
      { 
        id: 2, 
        name: 'Clothing', 
        visible: true,
        items: ['Shirt', 'Pants', 'Shoes']
      },
      { 
        id: 3, 
        name: 'Books', 
        visible: false,
        items: ['Fiction', 'Non-fiction', 'Comics']
      }
    ];

    this.users = [
      { id: 1, name: 'John Doe', active: true, role: 'Admin', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', active: true, role: 'User', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', active: false, role: 'User', email: 'bob@example.com' },
      { id: 4, name: 'Alice Williams', active: true, role: 'Moderator', email: 'alice@example.com' }
    ];

    this.nestedData = {
      level1: {
        title: 'Level 1',
        visible: true,
        level2: [
          {
            title: 'Level 2-A',
            visible: true,
            level3: ['Item 1', 'Item 2', 'Item 3']
          },
          {
            title: 'Level 2-B',
            visible: false,
            level3: ['Item 4', 'Item 5']
          }
        ]
      }
    };

    this.tableData = [
      { id: 1, product: 'Laptop', price: 999, inStock: true, quantity: 5 },
      { id: 2, product: 'Mouse', price: 29, inStock: true, quantity: 50 },
      { id: 3, product: 'Keyboard', price: 79, inStock: false, quantity: 0 },
      { id: 4, product: 'Monitor', price: 299, inStock: true, quantity: 12 }
    ];
  }

  toggleSection() {
    this.showSection = !this.showSection;
  }

  toggleCategoryVisibility(index: number) {
    this.categories[index].visible = !this.categories[index].visible;
  }

  addCategory() {
    this.categories.push({
      id: this.categories.length + 1,
      name: `Category ${this.categories.length + 1}`,
      visible: true,
      items: ['New Item 1', 'New Item 2']
    });
  }

  removeCategory(index: number) {
    this.categories.splice(index, 1);
  }

  setActiveCategory(index: number) {
    this.activeCategory = index;
  }

  selectUser(userId: number) {
    this.selectedUserId = userId;
  }

  toggleUserActive(index: number) {
    this.users[index].active = !this.users[index].active;
  }

  addUser() {
    this.users.push({
      id: this.users.length + 1,
      name: `User ${this.users.length + 1}`,
      active: true,
      role: 'User',
      email: `user${this.users.length + 1}@example.com`
    });
  }

  toggleLevel2(index: number) {
    this.nestedData.level1.level2[index].visible = !this.nestedData.level1.level2[index].visible;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  get selectedUser() {
    return this.users?.find(u => u.id === this.selectedUserId);
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="fill scroll" style="padding: 20px;">
        <h2>Nested Directives - Complex Combinations</h2>

        <hr>

        <h3>1. [if] + [foreach] Combination</h3>
        <div style="margin-bottom: 20px;">
          <button onclick="this.toggleSection()" class="btn btn-primary">
            Toggle Section ({{ this.showSection ? 'Hide' : 'Show' }})
          </button>
          <button onclick="this.addCategory()" class="btn btn-success">Add Category</button>
          
          <div [if]="this.showSection" style="margin-top: 10px; padding: 15px; background: #f8f9fa; border: 1px solid #ddd;">
            <strong>Categories List:</strong>
            
            <div [foreach]="catIndex in this.categories as category" style="margin-top: 10px;">
              <div style="padding: 10px; background: white; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong>{{ category.name }} (ID: {{ category.id }})</strong>
                  <div>
                    <button onclick="this.toggleCategoryVisibility(catIndex)" class="btn btn-sm btn-secondary">
                      {{ category.visible ? 'Hide' : 'Show' }} Items
                    </button>
                    <button onclick="this.removeCategory(catIndex)" class="btn btn-sm btn-danger">Remove</button>
                  </div>
                </div>
                
                <div [if]="category.visible" style="margin-top: 10px; padding-left: 20px;">
                  <ul style="list-style: circle;">
                    <div [foreach]="itemIndex in category.items as item">
                      <li>{{ item }}</li>
                    </div>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr>

        <h3>2. [foreach] + [class] + [style] + [if]</h3>
        <div style="margin-bottom: 20px;">
          <button onclick="this.addUser()" class="btn btn-success">Add User</button>
          
          <div style="margin-top: 10px;">
            <div [foreach]="userIndex in this.users as user">
              <div [if]="user.active"
                   [style]="{ 
                     padding: '10px', 
                     margin: '5px 0',
                     border: this.selectedUserId === user.id ? '3px solid blue' : '1px solid #ddd',
                     backgroundColor: user.role === 'Admin' ? '#ffe6e6' : user.role === 'Moderator' ? '#e6f3ff' : 'white',
                     cursor: 'pointer'
                   }"
                   onclick="this.selectUser(user.id)">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>{{ user.name }}</strong>
                    <span style="margin-left: 10px; padding: 2px 8px; background: #007bff; color: white; border-radius: 3px; font-size: 12px;">
                      {{ user.role }}
                    </span>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                      {{ user.email }}
                    </div>
                  </div>
                  <button onclick="this.toggleUserActive(userIndex); event.stopPropagation();" class="btn btn-sm btn-danger">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div [if]="this.selectedUserId" style="margin-top: 15px; padding: 15px; background: #e9ecef; border-radius: 5px;">
            <h4>Selected User Details:</h4>
            <div [if]="this.selectedUser">
              <p><strong>ID:</strong> {{ this.selectedUser.id }}</p>
              <p><strong>Name:</strong> {{ this.selectedUser.name }}</p>
              <p><strong>Role:</strong> {{ this.selectedUser.role }}</p>
              <p><strong>Email:</strong> {{ this.selectedUser.email }}</p>
              <p><strong>Status:</strong> {{ this.selectedUser.active ? 'Active' : 'Inactive' }}</p>
            </div>
          </div>

          <div style="margin-top: 10px; padding: 10px; background: #fff3cd;">
            <strong>Inactive Users:</strong>
            <div [foreach]="userIndex in this.users as user">
              <div [if]="!user.active" style="padding: 5px; border-bottom: 1px solid #ddd;">
                {{ user.name }} - {{ user.email }}
                <button onclick="this.toggleUserActive(userIndex)" class="btn btn-sm btn-success" style="margin-left: 10px;">
                  Activate
                </button>
              </div>
            </div>
          </div>
        </div>

        <hr>

        <h3>3. Three-Level Nested [foreach] + [if]</h3>
        <div style="margin-bottom: 20px;">
          <div [if]="this.nestedData.level1.visible" style="padding: 15px; background: #f0f0f0; border-left: 5px solid #007bff;">
            <h4>{{ this.nestedData.level1.title }}</h4>
            
            <div [foreach]="l2Index in this.nestedData.level1.level2 as level2Item" style="margin-left: 20px; margin-top: 10px;">
              <div style="padding: 10px; background: white; border: 1px solid #ddd; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong>{{ level2Item.title }}</strong>
                  <button onclick="this.toggleLevel2(l2Index)" class="btn btn-sm btn-primary">
                    {{ level2Item.visible ? 'Collapse' : 'Expand' }}
                  </button>
                </div>
                
                <div [if]="level2Item.visible" style="margin-left: 20px; margin-top: 10px;">
                  <ul>
                    <div [foreach]="l3Index in level2Item.level3 as level3Item">
                      <li>{{ level3Item }}</li>
                    </div>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr>

        <h3>4. Data Table with Complex Directives</h3>
        <div style="margin-bottom: 20px;">
          <button onclick="this.toggleAdvanced()" class="btn btn-primary">
            {{ this.showAdvanced ? 'Hide' : 'Show' }} Advanced View
          </button>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #007bff; color: white;">
                <th style="padding: 8px; border: 1px solid #ddd;">ID</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Stock Status</th>
                <th [if]="this.showAdvanced" style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
                <th [if]="this.showAdvanced" style="padding: 8px; border: 1px solid #ddd;">Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr [foreach]="rowIndex in this.tableData as row"
                  [style]="{
                    backgroundColor: !row.inStock ? '#ffe6e6' : rowIndex % 2 === 0 ? '#f8f9fa' : 'white'
                  }">
                <td style="padding: 8px; border: 1px solid #ddd;">{{ row.id }}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">{{ row.product }}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">\${{ row.price }}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  <span [style]="{ 
                    color: row.inStock ? 'green' : 'red',
                    fontWeight: 'bold'
                  }">
                    {{ row.inStock ? '✓ In Stock' : '✗ Out of Stock' }}
                  </span>
                </td>
                <td [if]="this.showAdvanced" style="padding: 8px; border: 1px solid #ddd;">
                  {{ row.quantity }}
                </td>
                <td [if]="this.showAdvanced" style="padding: 8px; border: 1px solid #ddd;">
                  \${{ row.price * row.quantity }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr>

        <h3>5. Dynamic Tab-Like Structure</h3>
        <div style="margin-bottom: 20px;">
          <div style="display: flex; border-bottom: 2px solid #ddd;">
            <div [foreach]="tabIndex in this.categories as category">
              <button [style]="{
                        padding: '10px 20px',
                        border: 'none',
                        borderBottom: this.activeCategory === tabIndex ? '3px solid #007bff' : '3px solid transparent',
                        background: this.activeCategory === tabIndex ? '#e9ecef' : 'transparent',
                        cursor: 'pointer',
                        fontWeight: this.activeCategory === tabIndex ? 'bold' : 'normal'
                      }"
                      onclick="this.setActiveCategory(tabIndex)">
                {{ category.name }}
              </button>
            </div>
          </div>
          
          <div [foreach]="tabIndex in this.categories as category">
            <div [if]="this.activeCategory === tabIndex" style="padding: 20px; background: #f8f9fa; margin-top: 10px;">
              <h4>{{ category.name }}</h4>
              <p>Category ID: {{ category.id }}</p>
              
              <ul>
                <div [foreach]="itemIndex in category.items as item">
                  <li>{{ item }}</li>
                </div>
              </ul>
            </div>
          </div>
        </div>

        <hr>

        <h3>6. Conditional Rendering with Counters</h3>
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: #f8f9fa; border: 1px solid #ddd;">
            <p><strong>Total Categories:</strong> {{ this.categories.length }}</p>
            <p><strong>Visible Categories:</strong> {{ this.categories.filter(c => c.visible).length }}</p>
            <p><strong>Total Users:</strong> {{ this.users.length }}</p>
            <p><strong>Active Users:</strong> {{ this.users.filter(u => u.active).length }}</p>
            <p><strong>In-Stock Products:</strong> {{ this.tableData.filter(p => p.inStock).length }}</p>
            
            <div [if]="this.categories.length > 0">
              <hr>
              <h4>Statistics by Category:</h4>
              <div [foreach]="catIndex in this.categories as category">
                <div style="padding: 5px; border-bottom: 1px solid #ddd;">
                  <strong>{{ category.name }}:</strong> {{ category.items.length }} items
                  <span [if]="category.visible" style="color: green; margin-left: 10px;">✓ Visible</span>
                  <span [if]="!category.visible" style="color: red; margin-left: 10px;">✗ Hidden</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `);
  }
}