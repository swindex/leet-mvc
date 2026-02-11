// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { Dialog } from "../../pages/DialogPage/DialogPage";

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
    const countries = [
      { text: "United States", value: "us" },
      { text: "Canada", value: "ca" },
      { text: "United Kingdom", value: "uk" },
      { text: "Germany", value: "de" },
      { text: "France", value: "fr" }
    ];

    Dialog("Select Country")
      .addSelect("country", "Country", "us", true, countries)
      .addActionButton("Submit", (dialog) => {
        if (dialog.validate()) {
          const selected = countries.find(c => c.value === dialog.data.country);
          alert(`Selected: ${selected.text}`);
        } else {
          return false;
        }
      })
      .addActionButton("Cancel", null);
  }

  // Dialog with radio buttons
  showRadioDialog() {
    const colors = [
      { text: "Red", value: "red" },
      { text: "Green", value: "green" },
      { text: "Blue", value: "blue" },
      { text: "Yellow", value: "yellow" }
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
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #007bff;">
          <h3>Test Coverage:</h3>
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
        </div>
      </div>
    `);
  }
}