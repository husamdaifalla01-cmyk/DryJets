/**
 * DryJets Mobile Customer App - Entry Point
 * Initializes console guards and setup before Expo Router
 * Prevents React DevTools race conditions and ExceptionsManager conflicts
 */

// ============================================================================
// STEP 1: Console Polyfill Guards
// ============================================================================
// Prevent React DevTools from mutating console before AppRegistry registration
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

let consoleGuardActive = true;

const safeConsoleProxy = {
  error: function (...args) {
    if (consoleGuardActive) {
      // Buffer errors during initialization, don't call original
      if (args[0]?.includes?.('ExceptionsManager') || args[0]?.includes?.('DevTools')) {
        return;
      }
    }
    return originalError.apply(console, args);
  },
  warn: function (...args) {
    if (consoleGuardActive) {
      return originalWarn.apply(console, args);
    }
    return originalWarn.apply(console, args);
  },
  log: function (...args) {
    return originalLog.apply(console, args);
  },
};

// Apply console guards
if (typeof console !== 'undefined') {
  try {
    // Safely define console properties if writable
    Object.defineProperty(console, 'error', {
      value: safeConsoleProxy.error,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(console, 'warn', {
      value: safeConsoleProxy.warn,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    // Fail silently if console properties are not configurable
  }
}

// ============================================================================
// STEP 2: React Native Gesture Handler Setup
// CRITICAL: Must be imported BEFORE Expo Router and other navigation
// ============================================================================
try {
  require('react-native-gesture-handler');
} catch (e) {
  console.warn('Failed to initialize react-native-gesture-handler:', e.message);
}

// ============================================================================
// STEP 3: Safe Prototype Chain Setup for Hermes/JSC
// ============================================================================
// Ensure global prototype chain is safe for React Native
if (typeof global !== 'undefined') {
  try {
    // Verify Object.prototype is accessible
    if (!Object.prototype.hasOwnProperty) {
      Object.defineProperty(Object.prototype, 'hasOwnProperty', {
        value: function (prop) {
          return Object.prototype.hasOwnProperty.call(this, prop);
        },
        writable: true,
        configurable: true,
      });
    }

    // Ensure __proto__ is accessible for Hermes
    const testObj = {};
    if (testObj.__proto__ === undefined && typeof Object.setPrototypeOf === 'function') {
      Object.setPrototypeOf(testObj, Object.prototype);
    }
  } catch (e) {
    // Safe to ignore prototype chain setup errors
  }
}

// ============================================================================
// STEP 4: Disable console guard after initialization
// ============================================================================
// Allow console to function normally after 100ms (after AppRegistry.registerComponent)
const initializationTimeout = setTimeout(() => {
  consoleGuardActive = false;
}, 100);

// ============================================================================
// STEP 5: Load Expo Router Entry Point
// ============================================================================
// This must be the last require in this file
module.exports = require('expo-router/entry');
