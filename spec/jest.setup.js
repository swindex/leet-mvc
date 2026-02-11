// Jest setup file
// This file runs before each test file

// Set up a basic DOM structure if needed
if (typeof document !== 'undefined') {
  document.body.innerHTML = '<div id="app"></div>';
}

// Mock deviceready event for Cordova
global.document.addEventListener = jest.fn((event, callback) => {
  if (event === 'deviceready') {
    // Immediately invoke the callback for tests
    setTimeout(callback, 0);
  }
});

// Add any global test utilities or mocks here