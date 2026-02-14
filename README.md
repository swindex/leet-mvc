# leet-mvc

A lightweight, reactive TypeScript MVC framework for building modern web applications with powerful data binding, component system, and page navigation.

It is designed to solve internal needs for fast prototyping and building complex web and hybrid apps with a clean and simple architecture and efficient rendering. It is not intended for public use or as a general-purpose framework.

## Features

### Core Features
- **Reactive Data Binding** - Automatic UI updates with two-way data binding
- **Component-Based Architecture** - Reusable, encapsulated components
- **Page Navigation** - Built-in navigation controller with history management
- **State Management** - Centralized state management with reactive updates
- **Dependency Injection** - Service injection system for better modularity
- **Internationalization** - Built-in translation support
- **Form Handling** - Comprehensive form validation and binding
- **Custom Directives** - Extensible directive system for DOM manipulation

### Directives
- `[bind]` or `bind` - Two-way data binding for form inputs (supports `format` attribute)
- `[text]` - One-way data binding for text content (supports `format` attribute)
- `[foreach]` - Array iteration and rendering
- `[if]` - Conditional rendering (removes/adds from DOM)
- `[show]` - Visibility control (toggles display: none)
- `[display]` - Direct display property control
- `[html]` - Render Template HTML content which behaves like normal HTML (with data binding and directives support)
- `[innerhtml]` - Raw HTML Without data binding or directive support
- `[component]` - Component embedding
- `[transition]` - CSS transitions and animations
- `[class]` - Dynamic class binding
- `[style]` - Dynamic style binding
- `[attribute]` - Dynamic attribute binding
- `[selected]` - Selected attribute for options

### Components
- **BaseComponent** - Base class for all components
- **PageComponent** - A component that can display a page within
- **Forms** - Form components with validation and generation from json schema
- **ItemList** - List rendering component
- **MultiSelect** - Multi-select dropdown
- **SimpleTabs** - Tab navigation
- **SwiperTabs** - Swipeable tabs
- **PhoneInput** - Phone number input with formatting

### Pages
- **BasePage** - Base page class with lifecycle hooks
- **DialogPage** - Modal dialog system
- **Toast** - Toast notifications
- **Loader** - Loading indicators
- **ActionSheet** - Action sheet modals
- **Calendar** - Date picker components
- **Menu** - Navigation menus

## Installation

```bash
npm install leet-mvc
```

## Quick Start

### 1. Create a Page

```typescript
import { BasePage } from 'leet-mvc';

export class MyPage extends BasePage {
  data = {
    title: 'Hello World',
    count: 0,
    items: ['Item 1', 'Item 2', 'Item 3']
  };

  get template() {
    return `
      <div>
        <h1 [html]="this.title"></h1>
        <button onclick="this.increment()">Count: {{this.count}}</button>
        
        <ul>
          <li [foreach]="item in this.items" [html]="item"></li>
        </ul>
      </div>
    `;
  }

  increment() {
    this.data.count++;
  }
}
```

### 2. Initialize Navigation

```typescript
import { NavController } from 'leet-mvc';
import { MyPage } from './pages/MyPage';

// Initialize navigation controller
const nav = new NavController({
  root: document.getElementById('app'),
  enableBrowserHistory: true
});

// Navigate to page
nav.push(MyPage);
```

## Data Binding

### Two-Way Binding

```html
<!-- Text input (both syntaxes work) -->
<input type="text" bind="this.username" />
<input type="text" [bind]="this.username" />

<!-- Checkbox -->
<input type="checkbox" [bind]="this.isActive" />

<!-- Select -->
<select [bind]="this.selectedOption">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

<!-- Textarea -->
<textarea [bind]="this.textContent" rows="4"></textarea>

<!-- Number input -->
<input type="number" [bind]="this.numberValue" />

<!-- Radio buttons -->
<input type="radio" name="choice" value="option1" [bind]="this.radioValue" />
<input type="radio" name="choice" value="option2" [bind]="this.radioValue" />
```

### One-Way Binding

```html
<!-- Display HTML content -->
<div [html]="this.message"></div>
<div [innerhtml]="this.htmlContent"></div>

<!-- Display text content (one-way) -->
<span [text]="this.username"></span>
<div [text]="this.description"></div>

<!-- Template expressions (mustache syntax) -->
<div>{{this.user.name}} - {{this.user.email}}</div>

<!-- Computed expressions -->
<div>{{this.count * 2}}</div>
<div>{{this.count > 5 ? 'High' : 'Low'}}</div>
```

### Value Formatting

Both `bind` and `[text]` directives support the `format` attribute for displaying values in different formats:

```html
<!-- Number formatting with decimal places -->
<input bind="this.price" format="number:2" />
<span [text]="this.price" format="number:2"></span>
<!-- Displays: 123.46 from value 123.456789 -->

<!-- Locale-aware number formatting -->
<input bind="this.amount" format="localenumber:2" type="text" />
<span [text]="this.amount" format="localenumber:2"></span>
<!-- Displays: 1,234.56 (in en-US locale) from value 1234.56 -->

<!-- Boolean formatting with custom labels -->
<input bind="this.isActive" format="boolean:Yes,No" />
<span [text]="this.isActive" format="boolean:Active,Inactive"></span>
<!-- Displays: "Yes" or "No" based on boolean value -->

<!-- Date formatting -->
<span [text]="this.createdAt" format="date"></span>
<!-- Displays: human-readable date -->

<!-- Time formatting -->
<span [text]="this.timestamp" format="time"></span>
<!-- Displays: human-readable time -->

<!-- DateTime formatting -->
<span [text]="this.lastLogin" format="dateTime"></span>
<!-- Displays: human-readable date and time -->

<!-- Dynamic format expressions -->
<input bind="this.value" format="number:this.decimalPlaces" />
<span [text]="this.value" format="number:this.precision"></span>
<!-- Decimal places determined by context property -->
```

#### Supported Format Types

**Number Formats:**
- `format="number"` - Formats as number with no decimal places
- `format="number:2"` - Formats as number with 2 decimal places
- `format="localenumber"` - Formats as locale-aware number
- `format="localenumber:2"` - Formats as locale-aware number with 2 decimals

**Boolean Formats:**
- `format="boolean"` - Converts true/false to "true"/"false"
- `format="boolean:Yes,No"` - Custom labels (first for true, second for false)

**Date/Time Formats:**
- `format="date"` - Human-readable date
- `format="time"` - Human-readable time
- `format="dateTime"` - Human-readable date and time

**Dynamic Formats:**
- `format="number:this.myPrecision"` - Use context property for format parameter

#### Format Behavior

For **`bind` directive** (two-way binding):
- **Display:** Formats value when displaying in form element
- **Input:** Parses formatted value back to model when user edits

For **`[text]` directive** (one-way binding):
- **Display only:** Formats value for display, no parsing back

```typescript
export class ProductPage extends BasePage {
  product = {
    name: 'Widget',
    price: 29.99,
    quantity: 1000,
    isAvailable: true,
    createdAt: new Date()
  };
  
  decimalPlaces = 2;

  get template() {
    return `
      <div>
        <h2>{{this.product.name}}</h2>
        
        <!-- Two-way binding with format -->
        <label>Price:</label>
        <input bind="this.product.price" format="number:2" />
        
        <!-- One-way binding with format -->
        <p>Display Price: <span [text]="this.product.price" format="number:2"></span></p>
        <p>Quantity: <span [text]="this.product.quantity" format="localenumber"></span></p>
        <p>Status: <span [text]="this.product.isAvailable" format="boolean:In Stock,Out of Stock"></span></p>
        <p>Created: <span [text]="this.product.createdAt" format="date"></span></p>
        
        <!-- Dynamic format -->
        <input bind="this.product.price" format="number:this.decimalPlaces" />
      </div>
    `;
  }
}
```

## Directives

### Conditional Rendering

```html
<!-- [if] removes/adds elements from DOM -->
<div [if]="this.isLoggedIn">
  <p>Welcome back!</p>
</div>

<div [if]="!this.isLoggedIn">
  <p>Please log in</p>
</div>

<!-- [show] toggles display: none -->
<div [show]="this.showDetails">
  <p>Details here...</p>
</div>

<!-- [display] sets display property directly -->
<div [display]="this.displayValue">
  <p>Content with dynamic display</p>
</div>
```

### List Rendering

```html
<!-- Simple foreach -->
<ul>
  <li [foreach]="user in this.users">
    <span>{{user.name}}</span>
  </li>
</ul>

<!-- With index -->
<div [foreach]="index in this.items as item">
  {{index}}: {{item.name}}
</div>

<!-- Nested foreach -->
<div [foreach]="categoryIndex in this.categories as category">
  <h3>{{category.name}}</h3>
  <ul>
    <li [foreach]="itemIndex in category.items as item">
      {{item}}
    </li>
  </ul>
</div>
```

### Event Handling

```html
<!-- Click events -->
<button onclick="this.handleClick()">Click me</button>

<!-- With parameters -->
<button onclick="this.deleteItem(item.id)">Delete</button>

<!-- Access event object -->
<input oninput="this.handleInput(event)" />
<button onclick="this.save(); event.stopPropagation()">Save</button>

<!-- Multiple events -->
<input 
  oninput="this.handleInput()" 
  onfocus="this.handleFocus()"
  onblur="this.handleBlur()"
/>

<!-- Form events -->
<form onsubmit="this.handleSubmit(event)">
  <input type="text" [bind]="this.formData.name" />
  <button type="submit">Submit</button>
</form>
```

### Dynamic Classes

```html
<!-- Single dynamic class -->
<div [class]="this.currentClass">
  Content
</div>

<!-- Conditional classes (via style object approach) -->
<div [style]="{
  padding: '10px',
  backgroundColor: this.isActive ? 'lightgreen' : 'lightgray'
}">
  Styled content
</div>
```

### Dynamic Styles

```html
<!-- Style object -->
<div [style]="this.styleObject">
  Styled text
</div>

<!-- In component -->
<script>
this.styleObject = {
  color: 'blue',
  fontSize: '16px',
  padding: '10px',
  border: '1px solid #ddd'
};
</script>

<!-- Conditional styles -->
<div [style]="{
  color: this.isError ? 'red' : 'green',
  fontWeight: this.isImportant ? 'bold' : 'normal',
  backgroundColor: this.isActive ? '#e3f2fd' : 'white'
}">
  Dynamic styled content
</div>
```

### Dynamic Attributes

```html
<!-- Attribute object -->
<div [attribute]="this.dynamicAttributes">
  Content with dynamic attributes
</div>

<!-- In component -->
<script>
this.dynamicAttributes = {
  'data-id': '123',
  'title': 'Hover text',
  'aria-label': 'Accessible label'
};
</script>

<!-- Conditional attributes -->
<button [attribute]="{ disabled: this.isDisabled ? 'disabled' : null }">
  Submit
</button>
```

### HTML Content

```html
<!-- Render HTML content -->
<div [html]="this.htmlContent"></div>

<!-- Alternative syntax -->
<div [innerhtml]="this.htmlContent"></div>

<!-- In component -->
<script>
this.htmlContent = '<strong>Bold</strong> and <em>italic</em> text';
</script>
```

## Components

### Creating a Component

```typescript
import { BaseComponent } from 'leet-mvc';

export class UserCard extends BaseComponent {
  data = {
    user: null
  };

  get template() {
    return `
      <div class="user-card">
        <h3>{{this.user.name}}</h3>
        <p>{{this.user.email}}</p>
        <button onclick="this.viewProfile()">View Profile</button>
      </div>
    `;
  }

  viewProfile() {
    console.log('Viewing profile for', this.data.user.name);
  }
}
```

### Using Components

```typescript
import { BasePage } from 'leet-mvc';
import { UserCard } from './components/UserCard';

export class UsersPage extends BasePage {
  userCard: UserCard;

  constructor() {
    super();
    this.userCard = new UserCard();
    this.userCard.data.user = { name: 'John Doe', email: 'john@example.com' };
  }

  get template() {
    return `
      <div>
        <h2>User Profile</h2>
        <div [component]="this.userCard"></div>
      </div>
    `;
  }
}
```

### Component with Data Binding

```typescript
export class UsersPage extends BasePage {
  users = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' }
  ];

  get template() {
    return `
      <div>
        <div [foreach]="user in this.users">
          <div [component]="this.createUserCard(user)"></div>
        </div>
      </div>
    `;
  }

  createUserCard(user) {
    const card = new UserCard();
    card.data.user = user;
    return card;
  }
}
```

## State Management

```typescript
import { State } from 'leet-mvc';

// Create a global state
export const appState = new State({
  user: null,
  isAuthenticated: false,
  settings: {}
});

// Update state
appState.set('user', { name: 'John' });
appState.set('isAuthenticated', true);

// Subscribe to changes
appState.subscribe('user', (newUser, oldUser) => {
  console.log('User changed:', newUser);
});

// Use in pages
export class MyPage extends BasePage {
  user = appState.get('user');

  onReady() {
    appState.subscribe('user', (user) => {
      this.user = user;
    });
  }
}
```

## Dependency Injection

```typescript
import { Injector } from 'leet-mvc';

// Create a service
class UserService {
  async getUsers() {
    return fetch('/api/users').then(r => r.json());
  }
}

// Register service
Injector.register('UserService', new UserService());

// Inject in page
export class UsersPage extends BasePage {
  userService = Injector.resolve('UserService');
  users = [];

  async onReady() {
    this.users = await this.userService.getUsers();
  }
}
```

## Internationalization

```typescript
import { Translate } from 'leet-mvc';

// Set translations
Translate.setTranslations({
  en: {
    welcome: 'Welcome',
    greeting: 'Hello {{name}}'
  },
  es: {
    welcome: 'Bienvenido',
    greeting: 'Hola {{name}}'
  }
});

// Set language
Translate.setLanguage('en');

// Use in templates
export class MyPage extends BasePage {
  get template() {
    return `
      <h1>{{Translate(this.welcomeKey)}}</h1>
      <p>{{Translate(this.greetingKey, this.user)}}</p>
    `;
  }
}

// Use in code
const welcomeText = Translate.translate('welcome');
```

## Navigation

### Basic Navigation

```typescript
import { NavController } from 'leet-mvc';
import { HomePage, ProfilePage } from './pages';

const nav = new NavController({
  root: document.getElementById('app'),
  enableBrowserHistory: true
});

// Push page
nav.push(HomePage);

// Push with data
nav.push(ProfilePage, { userId: 123 });

// Pop page (go back)
nav.pop();

// Replace current page
nav.replace(HomePage);

// Clear stack and set root
nav.setRoot(HomePage);
```

### Page Lifecycle

```typescript
export class MyPage extends BasePage {
  // Called when page is created
  onCreate(params) {
    console.log('Page created with params:', params);
  }

  // Called when page is ready (after rendering)
  onReady() {
    console.log('Page is ready');
  }

  // Called when page becomes active
  onResume() {
    console.log('Page resumed');
  }

  // Called when page becomes inactive
  onPause() {
    console.log('Page paused');
  }

  // Called when page is destroyed
  onDestroy() {
    console.log('Page destroyed');
  }
}
```

## Form Handling

### Using Forms Component

```typescript
import { BasePage } from 'leet-mvc';
import { Forms } from 'leet-mvc';

export class LoginPage extends BasePage {
  formData = {};
  formErrors = {};
  form: Forms;

  constructor() {
    super();
    
    const formTemplate = [
      { 
        type: "text", 
        name: "username", 
        title: "Username", 
        validateRule: "required" 
      },
      { 
        type: "password", 
        name: "password", 
        title: "Password", 
        validateRule: "required|min:6" 
      },
      { 
        type: "checkbox", 
        name: "remember", 
        title: "Remember me" 
      }
    ];

    this.form = new Forms(formTemplate, this.formData, this.formErrors);
  }

  get template() {
    return `
      <form onsubmit="this.handleSubmit(event)">
        <div [component]="this.form"></div>
        <button type="submit">Login</button>
      </form>
    `;
  }

  handleSubmit(event) {
    event.preventDefault();
    
    if (this.form.validator.validate()) {
      // Form is valid, proceed with login
      this.login();
    }
  }

  async login() {
    // Login logic using this.formData
  }
}
```

### Manual Form Validation

```typescript
export class RegisterPage extends BasePage {
  formData = {
    username: '',
    email: '',
    password: ''
  };
  
  errors = {};

  get template() {
    return `
      <form onsubmit="this.handleSubmit(event)">
        <div>
          <label>Username:</label>
          <input type="text" [bind]="this.formData.username" />
          <span [if]="this.errors.username">{{this.errors.username}}</span>
        </div>
        
        <div>
          <label>Email:</label>
          <input type="email" [bind]="this.formData.email" />
          <span [if]="this.errors.email">{{this.errors.email}}</span>
        </div>
        
        <div>
          <label>Password:</label>
          <input type="password" [bind]="this.formData.password" />
          <span [if]="this.errors.password">{{this.errors.password}}</span>
        </div>
        
        <button type="submit">Register</button>
      </form>
    `;
  }

  handleSubmit(event) {
    event.preventDefault();
    this.errors = {};

    // Validation
    if (!this.formData.username) {
      this.errors.username = 'Username is required';
    }

    if (!this.formData.email || !this.formData.email.includes('@')) {
      this.errors.email = 'Valid email is required';
    }

    if (!this.formData.password || this.formData.password.length < 6) {
      this.errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(this.errors).length === 0) {
      this.register();
    }
  }

  async register() {
    // Registration logic
  }
}
```

## Dialogs and Modals

```typescript
import { DialogPage } from 'leet-mvc';

// Show confirmation dialog
const result = await DialogPage.show({
  title: 'Confirm Action',
  message: 'Are you sure you want to continue?',
  buttons: ['Cancel', 'OK']
});

if (result === 'OK') {
  // User clicked OK
}

// Custom dialog content
const result = await DialogPage.show({
  title: 'User Details',
  content: '<div><p>Custom HTML content here</p></div>',
  buttons: ['Close']
});
```

## Toast Notifications

```typescript
import { Toast } from 'leet-mvc';

// Show toast
Toast.show({
  message: 'Operation completed successfully',
  duration: 3000
});

// Different toast types (if supported)
Toast.show({
  message: 'An error occurred',
  duration: 3000,
  type: 'error'
});
```

## Advanced Features

### Change Detection



```typescript
import { ChangeWatcher } from 'leet-mvc';

const watcher = new ChangeWatcher(myObject);

watcher.onChange((path, newValue, oldValue) => {
  console.log(`${path} changed from ${oldValue} to ${newValue}`);
});

// Changes to myObject will trigger the callback
myObject.someProperty = 'new value';
```

### Complex Nested Directives

```html
<!-- Nested [if] and [foreach] -->
<div [if]="this.showSection">
  <div [foreach]="category in this.categories">
    <h3>{{category.name}}</h3>
    <div [if]="category.visible">
      <ul>
        <li [foreach]="item in category.items">
          {{item}}
        </li>
      </ul>
    </div>
  </div>
</div>

<!-- Complex table with multiple directives -->
<table>
  <tr [foreach]="row in this.tableData"
      [style]="{
        backgroundColor: row.isActive ? 'lightgreen' : 'white'
      }">
    <td>{{row.id}}</td>
    <td>{{row.name}}</td>
    <td [if]="this.showDetails">{{row.details}}</td>
  </tr>
</table>
```

## Grid System

The framework includes a Bootstrap-style responsive grid system supporting rows, columns, responsive breakpoints, and configurable gutters/margins.

Use it in root styles.scss:

```scss
@use 'leet-mvc/scss/grid';
```

### SCSS Customization (Compile-time)

To customize breakpoints, container widths, or the number of columns, override SCSS variables **before** importing the grid:

```scss
// In your main SCSS file
@use 'grid' with (
  $grid-breakpoints: (
    xs: 0,
    sm: 576px,    // Override default 350px
    md: 768px,    // Override default 600px
    lg: 992px,
    xl: 1200px,
    xxl: 1400px   // Add new breakpoint
  ),
  $container-max-widths: (
    sm: 540px,
    md: 720px,
    lg: 960px,
    xl: 1140px,
    xxl: 1320px
  ),
  $grid-columns: 12,           // Number of columns
  $grid-gutter-width: 1.5rem   // Default gutter size
);
```

**Note:** Breakpoints **must** be SCSS variables because CSS custom properties cannot be used in `@media` queries (media queries are evaluated at parse-time, not runtime). Gutters use CSS variables for runtime flexibility.


## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## TypeScript Support

The library is written in TypeScript and includes full type definitions. All APIs are fully typed for the best development experience.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run development server
npm run dev
```

## Key Concepts

### Template Syntax
- **Directives**: Use square bracket syntax `[directive]="value"`
- **Expressions**: Use double curly braces `{{expression}}`Expressions are only allowed inside the HTML content, not in directive or attribute values!
- **Events**: Use standard HTML event attributes `onclick="method()"`
- **Data Binding**: Use `bind` or `[bind]` for two-way binding

### Page Structure
- Extend `BasePage` for all pages
- Define `template` as a getter method that returns HTML string
- Use lifecycle hooks (onCreate, onReady, onPause, onResume, onDestroy)
- Access page data directly via `this` in templates

### Reactivity
- Changes to component properties automatically update the UI
- Use `this` to reference component properties in templates
- Template expressions are re-evaluated when dependencies change

## License

[Check package.json for license information]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the GitHub issue tracker.