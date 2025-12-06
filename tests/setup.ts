import '@testing-library/jest-dom';

// Workaround for JSDOM/webidl-conversions TypeError
// Ensure global.URL is defined for environments where it might be missing or incorrectly initialized.
// This specific error often occurs when `webidl-conversions` (a dependency of `whatwg-url`)
// tries to access a `get` method on an undefined context, usually related to global Web APIs.
if (typeof global.URL === 'undefined') {
  // Use Node.js's native URL implementation as a fallback
  // This assumes 'url' module is available in the Node.js environment
  try {
    global.URL = require('url').URL;
  } catch (error) {
    console.error("Failed to polyfill global.URL using 'url' module:", error);
    // Fallback to a minimal mock if 'url' module is not available or throws an error
    global.URL = class MockURL {
        constructor(input, base) {
            console.warn("Using MockURL fallback. 'global.URL' was undefined and 'url' module polyfill failed.", { input, base });
            this.href = input;
            // Add basic properties if needed for the specific test case
            this.origin = 'mock-origin';
            this.protocol = 'mock-protocol:';
            this.host = 'mock-host';
            this.pathname = '/mock-pathname';
            // You might need to extend this mock based on actual usage in tests
        }
    };
  }
}
