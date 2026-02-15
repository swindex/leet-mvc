import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { Dialog } from "../../pages/DialogPage/DialogPage";
import { OptionsDialogPage } from "../../pages/OptionsDialogPage/OptionsDialogPage";
import { Injector } from "../../core/Injector";
import { SelectOption } from "../../typings/FormTypes";

export class TestDialogPage extends HeaderPage {
  constructor() {
    super();
  }

  // Basic dialog with simple message and OK button
  showBasicDialog() {
    Dialog("Basic Dialog")
      .addLabel("Message", "This is a simple dialog with a message and an OK button.")
      .addActionButton("OK", null);
  }

  // Dialog with flexible popup style (default)
  showFlexibleDialog() {
    Dialog("Flexible Style", "flexible")
      .addLabel("Style", "This dialog uses the 'flexible' popup style (default).")
      .addActionButton("Close", null);
  }

  // Dialog with large popup style
  showLargeDialog() {
    Dialog("Large Style", "large")
      .addLabel("Style", "This dialog uses the 'large' popup style.")
      .addLabel("Info", "Large dialogs take up more screen space.")
      .addActionButton("Close", null);
  }

  // Dialog that doesn't close when clicking outside
  showNoCloseOutsideDialog() {
    const d = Dialog("No Close Outside");
    d.close_on_click_outside = false;
    d.addLabel("Notice", "This dialog won't close when you click outside. You must click the button.")
      .addActionButton("OK", null);
  }

  // Dialog with text input
  showTextInputDialog() {
    Dialog("Text Input")
      .addText("username", "Username", "", true)
      .addText("email", "Email", "user@example.com", false)
      .addActionButton("Submit", (dialog) => {
        if (dialog.validate()) {
          alert(`Username: ${dialog.data.username}\nEmail: ${dialog.data.email}`);
        } else {
          return false; // Don't close dialog if validation fails
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with password input
  showPasswordDialog() {
    Dialog("Password Input")
      .addText("oldPassword", "Old Password", "", true)
      .addPassword("newPassword", "New Password", "", true)
      .addPassword("confirmPassword", "Confirm Password", "", true)
      .addActionButton("Change", (dialog) => {
        if (dialog.validate()) {
          if (dialog.data.newPassword === dialog.data.confirmPassword) {
            alert("Password changed successfully!");
          } else {
            alert("Passwords don't match!");
            return false;
          }
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with textarea
  showTextAreaDialog() {
    Dialog("Comments")
      .addTextArea("comments", "Your Comments", "", true)
      .addActionButton("Submit", (dialog) => {
        if (dialog.validate()) {
          alert(`Comments:\n${dialog.data.comments}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with date picker
  showDateDialog() {
    const today = new Date().toISOString().split('T')[0];
    Dialog("Select Date")
      .addDate("appointmentDate", "Appointment Date", today, true)
      .addActionButton("Confirm", (dialog) => {
        if (dialog.validate()) {
          alert(`Selected date: ${dialog.data.appointmentDate}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with datetime picker
  showDateTimeDialog() {
    const now = new Date().toISOString().slice(0, 16);
    Dialog("Select Date & Time")
      .addDateTime("eventDateTime", "Event Date & Time", now, true)
      .addActionButton("Confirm", (dialog) => {
        if (dialog.validate()) {
          alert(`Selected: ${dialog.data.eventDateTime}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with time picker
  showTimeDialog() {
    Dialog("Select Time")
      .addTime("meetingTime", "Meeting Time", "14:00", true)
      .addActionButton("Confirm", (dialog) => {
        if (dialog.validate()) {
          alert(`Selected time: ${dialog.data.meetingTime}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with checkbox
  showCheckboxDialog() {
    Dialog("Terms & Conditions")
      .addLabel("Agreement", "Please read and accept the terms:")
      .addCheck("terms", "I agree to the terms and conditions", false, true)
      .addCheck("newsletter", "Subscribe to newsletter", true, false)
      .addActionButton("Continue", (dialog) => {
        if (dialog.validate()) {
          alert(`Terms: ${dialog.data.terms}\nNewsletter: ${dialog.data.newsletter}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with select dropdown
  showSelectDialog() {
    const countries: SelectOption[] = [
      { title: "United States", value: "us" },
      { title: "Canada", value: "ca" },
      { title: "United Kingdom", value: "uk" },
      { title: "Germany", value: "de" },
      { title: "France", value: "fr" }
    ];

    Dialog("Select Country")
      .addSelect("country", "Country", "us", true, countries)
      .addActionButton("Submit", (dialog) => {
        if (dialog.validate()) {
          const selected = countries.find(c => c.value === dialog.data.country);
          alert(`Selected: ${selected?.title}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with radio buttons
  showRadioDialog() {
    const colors = [
      { title: "Red", value: "red" },
      { title: "Green", value: "green" },
      { title: "Blue", value: "blue" },
      { title: "Yellow", value: "yellow" }
    ];

    Dialog("Choose Color")
      .addRadio("color", "Favorite Color", "blue", true, colors)
      .addActionButton("Submit", (dialog) => {
        if (dialog.validate()) {
          alert(`Selected color: ${dialog.data.color}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with link
  showLinkDialog() {
    Dialog("External Link")
      .addLabel("Info", "Click the link below to visit the website:")
      .addLink("website", "Visit Example.com", "https://example.com", { target: "_blank" })
      .addActionButton("Close", null);
  }

  // Dialog with HTML content
  showHtmlContentDialog() {
    const htmlContent = `
      <div style="padding: 10px; background: #f0f0f0; border-radius: 5px;">
        <h3 style="color: #333; margin-top: 0;">Welcome!</h3>
        <p>This is <strong>custom HTML content</strong> rendered inside the dialog.</p>
        <ul>
          <li>Bullet point 1</li>
          <li>Bullet point 2</li>
          <li>Bullet point 3</li>
        </ul>
        <p style="color: #666; font-style: italic;">HTML content allows full customization.</p>
      </div>
    `;

    Dialog("HTML Content")
      .addHtml(htmlContent)
      .addActionButton("OK", null);
  }

  // Dialog with split layout
  showSplitLayoutDialog() {
    Dialog("Split Layout", "large")
      .addSplit([
        { name: "firstName", type: "text", title: "First Name", value: "John" },
        { name: "lastName", type: "text", title: "Last Name", value: "Doe" }
      ])
      .addSplit([
        { name: "city", type: "text", title: "City", value: "New York" },
        { name: "state", type: "text", title: "State", value: "NY" }
      ])
      .addActionButton("Submit", (dialog) => {
        alert(`Name: ${dialog.data.firstName} ${dialog.data.lastName}\nLocation: ${dialog.data.city}, ${dialog.data.state}`);
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with mixed content types
  showMixedContentDialog() {
    Dialog("Registration Form", "large")
      .addLabel("Personal Info", "Please fill in your details:")
      .addText("fullName", "Full Name", "", true)
      .addText("email", "Email", "", "email")
      .addDate("birthDate", "Birth Date", "", true)
      .addLabel("Preferences", "")
      .addCheck("terms", "I agree to terms and conditions", false, true)
      .addCheck("marketing", "Send me promotional emails", false, false)
      .addTextArea("bio", "Short Bio", "", false)
      .addActionButton("Register", (dialog) => {
        if (dialog.validate()) {
          alert("Registration submitted!");
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with multiple action buttons
  showMultipleButtonsDialog() {
    Dialog("Save Options")
      .addLabel("Question", "How would you like to save your changes?")
      .addActionButton("Save", () => {
        alert("Changes saved!");
      })
      .addActionButton("Save As", () => {
        alert("Save as new file!");
      })
      .addActionButton("Discard", () => {
        alert("Changes discarded!");
      })
      .addActionButton("Cancel", null);
  }

  // Dialog that dynamically adds/removes fields
  showDynamicFieldsDialog() {
    const d = Dialog("Dynamic Fields");
    d.addLabel("Info", "Click buttons to add or remove fields dynamically.");
    
    let fieldCount = 0;

    d.addActionButton("Add Field", (dialog) => {
      fieldCount++;
      dialog.addText(`field${fieldCount}`, `Field ${fieldCount}`, "", false);
      return false; // Don't close dialog
    });

    d.addActionButton("Remove Last", (dialog) => {
      if (fieldCount > 0) {
        dialog.removeField(`field${fieldCount}`);
        fieldCount--;
      }
      return false; // Don't close dialog
    });

    d.addActionButton("Done", null);
  }

  // Dialog with validation
  showValidationDialog() {
    Dialog("Form Validation")
      .addText("required", "Required Field", "", true)
      .addText("email", "Email (valid format)", "", "email")
      .addText("optional", "Optional Field", "", false)
      .addActionButton("Validate & Submit", (dialog) => {
        if (dialog.validate()) {
          alert("All validations passed!");
        } else {
          alert("Please fix validation errors!");
          return false; // Don't close dialog
        }
      })
      .addActionButton("Cancel", null);
  }

  // Nested dialog - dialog opening from another dialog
  showNestedDialogExample() {
    const d = Dialog("Parent Dialog");
    d.addLabel("Info", "This dialog can open another dialog.");
    d.addActionButton("Open Nested Dialog", (dialog) => {
      Dialog("Nested Dialog")
        .addLabel("Message", "This is a dialog opened from another dialog!")
        .addActionButton("OK", null);
      return false; // Don't close parent dialog
    });
    d.addActionButton("Close Parent", null);
  }

  // Dialog with prompt
  showPromptDialog() {
    const d = Dialog("Dialog with Prompt");
    d.prompt = "This is a prompt message that appears below the title.";
    d.addText("response", "Your Response", "", false)
      .addActionButton("Submit", (dialog) => {
        alert(`Response: ${dialog.data.response}`);
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with custom attributes
  showCustomAttributesDialog() {
    Dialog("Custom Attributes")
      .addText("customInput", "Input with Placeholder", "", false, {
        placeholder: "Enter text here...",
        maxlength: "50"
      })
      .addTextArea("customTextArea", "TextArea with Rows", "", false, {
        rows: "5",
        placeholder: "Type multiple lines..."
      })
      .addActionButton("OK", null);
  }

  // ========== OptionsDialogPage Demos ==========

  // Basic single selection (radio-style)
  showOptionsDialogSingle() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Select Your Favorite";
    page.multiple = false;
    page.items = [
      { title: "Apple", text: "A sweet red fruit", selected: false },
      { title: "Banana", text: "A yellow tropical fruit", selected: true },
      { title: "Orange", text: "A citrus fruit", selected: false },
      { title: "Grape", text: "Small purple or green fruits", selected: false }
    ];
    page.onItemClicked = (item, index) => {
      alert(`You selected: ${item.title}`);
    };
    page.update();
  }

  // Multiple selection with checkboxes
  showOptionsDialogMultiple() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Select Multiple Items";
    page.multiple = true;
    page.items = [
      { title: "JavaScript", text: "Programming language", selected: true },
      { title: "TypeScript", text: "Typed superset of JavaScript", selected: true },
      { title: "Python", text: "High-level programming language", selected: false },
      { title: "Java", text: "Object-oriented language", selected: false },
      { title: "C++", text: "Systems programming language", selected: false }
    ];
    page.onOkClicked = (selectedItems) => {
      const names = selectedItems.map(item => item.title).join(", ");
      alert(`Selected: ${names}`);
    };
    page.update();
  }

  // Options with custom icons
  showOptionsDialogWithIcons() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Choose a Theme";
    page.multiple = false;
    page.items = [
      { title: "Light Theme", text: "Default light theme", icon: "fas fa-sun", selected: false },
      { title: "Dark Theme", text: "Easy on the eyes", icon: "fas fa-moon", selected: true },
      { title: "Auto", text: "System preference", icon: "fas fa-adjust", selected: false }
    ];
    page.onItemClicked = (item, index) => {
      alert(`Theme changed to: ${item.title}`);
    };
    page.update();
  }

  // Options with images
  showOptionsDialogWithImages() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Select Avatar";
    page.multiple = false;
    page.items = [
      { title: "Avatar 1", text: "Professional style", image: "https://via.placeholder.com/50/FF6B6B/FFFFFF?text=A1", selected: false },
      { title: "Avatar 2", text: "Casual style", image: "https://via.placeholder.com/50/4ECDC4/FFFFFF?text=A2", selected: true },
      { title: "Avatar 3", text: "Creative style", image: "https://via.placeholder.com/50/45B7D1/FFFFFF?text=A3", selected: false }
    ];
    page.onItemClicked = (item, index) => {
      alert(`Selected: ${item.title}`);
    };
    page.update();
  }

  // Options with preselected items
  showOptionsDialogPreselected() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Select Notifications";
    page.multiple = true;
    page.items = [
      { title: "Email Notifications", text: "Receive updates via email", selected: true },
      { title: "SMS Notifications", text: "Get text messages", selected: false },
      { title: "Push Notifications", text: "Browser notifications", selected: true },
      { title: "In-App Notifications", text: "Show inside the app", selected: true }
    ];
    page.onOkClicked = (selectedItems) => {
      const count = selectedItems.length;
      alert(`${count} notification type(s) enabled`);
    };
    page.update();
  }

  // Options with disabled items
  showOptionsDialogDisabled() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Select Payment Method";
    page.multiple = false;
    page.items = [
      { title: "Credit Card", text: "Visa, MasterCard, Amex", selected: true, disabled: false },
      { title: "PayPal", text: "Digital wallet", selected: false, disabled: false },
      { title: "Bitcoin", text: "Cryptocurrency", selected: false, disabled: true },
      { title: "Bank Transfer", text: "Direct transfer", selected: false, disabled: true }
    ];
    page.onItemClicked = (item, index) => {
      alert(`Payment method: ${item.title}`);
    };
    page.update();
  }

  // Options with custom callbacks
  showOptionsDialogCallback() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Select Items with Callback";
    page.multiple = true;
    page.items = [
      { title: "Item A", text: "First item", selected: false },
      { title: "Item B", text: "Second item", selected: false },
      { title: "Item C", text: "Third item", selected: false }
    ];
    
    // Custom item clicked callback
    page.onItemClicked = (item, index) => {
      console.log(`Item clicked: ${item.title}, Index: ${index}, Selected: ${item.selected}`);
      // Return false to prevent default behavior
      // return false;
    };
    
    // Custom OK button callback
    page.onOkClicked = (selectedItems) => {
      if (selectedItems.length === 0) {
        alert("Please select at least one item!");
        return false; // Don't close dialog
      }
      const titles = selectedItems.map(i => i.title).join(", ");
      alert(`Selected items: ${titles}`);
    };
    
    page.update();
  }

  // Options with custom selection icons
  showOptionsDialogCustomIcons() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Custom Icon Style";
    page.multiple = false;
    page.items = [
      { title: "Option 1", text: "First option", selected: false },
      { title: "Option 2", text: "Second option", selected: true },
      { title: "Option 3", text: "Third option", selected: false },
      { title: "Disabled Option", text: "Cannot select", selected: false, disabled: true }
    ];
    
    // Customize the selection icons
    page.icons = {
      selected: 'fas fa-check-circle',
      deselected: 'far fa-circle',
      disabled: 'fas fa-ban'
    };
    
    page.onItemClicked = (item, index) => {
      alert(`Selected: ${item.title}`);
    };
    
    page.update();
  }

  // Options with no close on outside click
  showOptionsDialogNoCloseOutside() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Select Language (Required)";
    page.closeOnOutsideClick = false;
    page.multiple = false;
    page.items = [
      { title: "English", text: "English (United States)", selected: true },
      { title: "Español", text: "Spanish", selected: false },
      { title: "Français", text: "French", selected: false },
      { title: "Deutsch", text: "German", selected: false }
    ];
    page.onItemClicked = (item, index) => {
      alert(`Language set to: ${item.title}`);
    };
    page.update();
  }

  // Options with hideOverflow
  showOptionsDialogHideOverflow() {
    const page = Injector.Nav.push(OptionsDialogPage) as OptionsDialogPage;
    page.title = "Long List of Options";
    page.hideOverflow = true;
    page.multiple = false;
    
    // Generate many items
    page.items = [];
    for (let i = 1; i <= 20; i++) {
      page.items.push({
        title: `Option ${i}`,
        text: `Description for option ${i}`,
        selected: i === 10
      });
    }
    
    page.onItemClicked = (item, index) => {
      alert(`Selected: ${item.title}`);
    };
    
    page.update();
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div class="fill scroll" style="padding: 20px;">
        <h1>Dialog Component Tests</h1>
        <p>Click buttons below to test various Dialog functionalities:</p>

        <hr>
        <h2>Basic Dialogs</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showBasicDialog()" class="btn btn-primary">Basic Dialog</button>
          <button onclick="this.showFlexibleDialog()" class="btn btn-primary">Flexible Style</button>
          <button onclick="this.showLargeDialog()" class="btn btn-primary">Large Style</button>
          <button onclick="this.showNoCloseOutsideDialog()" class="btn btn-primary">No Close Outside</button>
          <button onclick="this.showPromptDialog()" class="btn btn-primary">With Prompt</button>
        </div>

        <hr>
        <h2>Input Types</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showTextInputDialog()" class="btn btn-success">Text Input</button>
          <button onclick="this.showPasswordDialog()" class="btn btn-success">Password</button>
          <button onclick="this.showTextAreaDialog()" class="btn btn-success">TextArea</button>
        </div>

        <hr>
        <h2>Date & Time Inputs</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showDateDialog()" class="btn btn-info">Date Picker</button>
          <button onclick="this.showDateTimeDialog()" class="btn btn-info">DateTime Picker</button>
          <button onclick="this.showTimeDialog()" class="btn btn-info">Time Picker</button>
        </div>

        <hr>
        <h2>Selection Controls</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showCheckboxDialog()" class="btn btn-warning">Checkbox</button>
          <button onclick="this.showSelectDialog()" class="btn btn-warning">Select Dropdown</button>
          <button onclick="this.showRadioDialog()" class="btn btn-warning">Radio Buttons</button>
        </div>

        <hr>
        <h2>Content Types</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showLinkDialog()" class="btn btn-secondary">Link</button>
          <button onclick="this.showHtmlContentDialog()" class="btn btn-secondary">HTML Content</button>
          <button onclick="this.showSplitLayoutDialog()" class="btn btn-secondary">Split Layout</button>
        </div>

        <hr>
        <h2>Advanced Features</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showMixedContentDialog()" class="btn btn-danger">Mixed Content</button>
          <button onclick="this.showMultipleButtonsDialog()" class="btn btn-danger">Multiple Buttons</button>
          <button onclick="this.showDynamicFieldsDialog()" class="btn btn-danger">Dynamic Fields</button>
          <button onclick="this.showValidationDialog()" class="btn btn-danger">Validation</button>
          <button onclick="this.showNestedDialogExample()" class="btn btn-danger">Nested Dialog</button>
          <button onclick="this.showCustomAttributesDialog()" class="btn btn-danger">Custom Attributes</button>
        </div>

        <hr>
        <h2>OptionsDialogPage - Single Selection</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showOptionsDialogSingle()" class="btn" style="background: #9C27B0; color: white;">Single Selection</button>
          <button onclick="this.showOptionsDialogWithIcons()" class="btn" style="background: #9C27B0; color: white;">With Custom Icons</button>
          <button onclick="this.showOptionsDialogWithImages()" class="btn" style="background: #9C27B0; color: white;">With Images</button>
          <button onclick="this.showOptionsDialogDisabled()" class="btn" style="background: #9C27B0; color: white;">With Disabled Items</button>
          <button onclick="this.showOptionsDialogCustomIcons()" class="btn" style="background: #9C27B0; color: white;">Custom Selection Icons</button>
          <button onclick="this.showOptionsDialogNoCloseOutside()" class="btn" style="background: #9C27B0; color: white;">No Close Outside</button>
        </div>

        <hr>
        <h2>OptionsDialogPage - Multiple Selection</h2>
        <div style="margin-bottom: 10px;">
          <button onclick="this.showOptionsDialogMultiple()" class="btn" style="background: #673AB7; color: white;">Multiple Selection</button>
          <button onclick="this.showOptionsDialogPreselected()" class="btn" style="background: #673AB7; color: white;">With Preselected Items</button>
          <button onclick="this.showOptionsDialogCallback()" class="btn" style="background: #673AB7; color: white;">Custom Callbacks</button>
          <button onclick="this.showOptionsDialogHideOverflow()" class="btn" style="background: #673AB7; color: white;">Long List (Overflow)</button>
        </div>

        <hr>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #007bff;">
          <h3>Test Coverage:</h3>
          
          <h4 style="margin-top: 15px; color: #007bff;">DialogPage:</h4>
          <ul>
            <li>✓ Basic dialog creation with title and buttons</li>
            <li>✓ Flexible and Large popup styles</li>
            <li>✓ Click outside to close behavior</li>
            <li>✓ All form input types (text, password, textarea, date, datetime, time)</li>
            <li>✓ Selection controls (checkbox, select, radio)</li>
            <li>✓ Content types (label, link, HTML, split)</li>
            <li>✓ Form validation</li>
            <li>✓ Multiple action buttons with callbacks</li>
            <li>✓ Dynamic field manipulation</li>
            <li>✓ Nested dialogs</li>
            <li>✓ Custom field attributes</li>
            <li>✓ Dialog with prompt message</li>
          </ul>

          <h4 style="margin-top: 15px; color: #9C27B0;">OptionsDialogPage:</h4>
          <ul>
            <li>✓ Single selection mode (radio-style)</li>
            <li>✓ Multiple selection mode (checkbox-style)</li>
            <li>✓ Items with title and text description</li>
            <li>✓ Items with custom icons</li>
            <li>✓ Items with images</li>
            <li>✓ Preselected items</li>
            <li>✓ Disabled items</li>
            <li>✓ Custom onItemClicked callback</li>
            <li>✓ Custom onOkClicked callback (multiple mode)</li>
            <li>✓ Custom selection icons (selected/deselected/disabled)</li>
            <li>✓ closeOnOutsideClick configuration</li>
            <li>✓ hideOverflow for long lists</li>
            <li>✓ Auto-scroll to selected item</li>
          </ul>
        </div>
      </div>
    `);
  }
}