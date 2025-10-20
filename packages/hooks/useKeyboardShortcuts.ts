/**
 * useKeyboardShortcuts - Global keyboard shortcuts manager
 *
 * Inspired by Raycast and Linear, provides enterprise-grade keyboard navigation
 *
 * Default shortcuts:
 * - ⌘K / Ctrl+K: Command palette
 * - ⌘B / Ctrl+B: Toggle sidebar
 * - ⌘/ / Ctrl+/: Show shortcuts help
 * - ⌘N / Ctrl+N: New item
 * - ⌘S / Ctrl+S: Save (prevent default)
 * - ⌘F / Ctrl+F: Search (prevent default)
 * - Esc: Close modals/dialogs
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  /** Unique identifier */
  id: string;
  /** Human-readable description */
  description: string;
  /** Key combination (e.g., 'cmd+k', 'ctrl+s', 'esc') */
  keys: string;
  /** Callback to execute */
  callback: (event: KeyboardEvent) => void;
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean;
  /** Stop event propagation (default: false) */
  stopPropagation?: boolean;
  /** Only trigger when specific element has focus */
  scope?: string;
  /** Enable in input fields (default: false) */
  enableInInputs?: boolean;
}

interface KeyboardShortcutsManager {
  shortcuts: Map<string, KeyboardShortcut>;
  register: (shortcut: KeyboardShortcut) => void;
  unregister: (id: string) => void;
  getAll: () => KeyboardShortcut[];
}

// Global shortcuts registry
const shortcutsRegistry: Map<string, KeyboardShortcut> = new Map();

/**
 * Parse key combination string into components
 */
function parseKeys(keys: string): {
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} {
  const parts = keys.toLowerCase().split('+');

  return {
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('cmd') || parts.includes('meta'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    key: parts[parts.length - 1],
  };
}

/**
 * Check if keyboard event matches shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const parsed = parseKeys(shortcut.keys);

  // Match modifiers
  if (parsed.ctrl !== event.ctrlKey) return false;
  if (parsed.meta !== event.metaKey) return false;
  if (parsed.shift !== event.shiftKey) return false;
  if (parsed.alt !== event.altKey) return false;

  // Match key
  const eventKey = event.key.toLowerCase();
  if (parsed.key !== eventKey && parsed.key !== event.code.toLowerCase()) {
    return false;
  }

  return true;
}

/**
 * Check if event target is an input field
 */
function isInputField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  const contentEditable = target.getAttribute('contenteditable') === 'true';

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    contentEditable
  );
}

/**
 * Global keyboard event handler
 */
function handleKeyboardEvent(event: KeyboardEvent) {
  const isInput = isInputField(event.target);

  // Check all registered shortcuts
  for (const shortcut of shortcutsRegistry.values()) {
    // Skip if in input and not enabled
    if (isInput && !shortcut.enableInInputs) continue;

    // Check if shortcut matches
    if (matchesShortcut(event, shortcut)) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }

      shortcut.callback(event);
      break; // Only trigger first matching shortcut
    }
  }
}

/**
 * Initialize global keyboard shortcuts listener
 */
export function initKeyboardShortcuts(): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('keydown', handleKeyboardEvent);

  console.log('[KeyboardShortcuts] Initialized');

  return () => {
    window.removeEventListener('keydown', handleKeyboardEvent);
    console.log('[KeyboardShortcuts] Cleaned up');
  };
}

/**
 * React hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    // Register shortcuts
    shortcuts.forEach((shortcut) => {
      shortcutsRegistry.set(shortcut.id, shortcut);
    });

    // Cleanup on unmount
    return () => {
      shortcuts.forEach((shortcut) => {
        shortcutsRegistry.delete(shortcut.id);
      });
    };
  }, [shortcuts]);
}

/**
 * Hook to register a single shortcut
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  useKeyboardShortcuts([shortcut]);
}

/**
 * Get all registered shortcuts (for help menu)
 */
export function getAllShortcuts(): KeyboardShortcut[] {
  return Array.from(shortcutsRegistry.values());
}

/**
 * Format shortcut keys for display
 */
export function formatShortcutKeys(keys: string): string {
  const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  return keys
    .split('+')
    .map((key) => {
      switch (key.toLowerCase()) {
        case 'cmd':
        case 'meta':
          return isMac ? '⌘' : 'Ctrl';
        case 'ctrl':
          return isMac ? '⌃' : 'Ctrl';
        case 'shift':
          return '⇧';
        case 'alt':
          return isMac ? '⌥' : 'Alt';
        case 'enter':
          return '↵';
        case 'esc':
        case 'escape':
          return 'Esc';
        case 'backspace':
          return '⌫';
        case 'delete':
          return '⌦';
        case 'arrowup':
          return '↑';
        case 'arrowdown':
          return '↓';
        case 'arrowleft':
          return '←';
        case 'arrowright':
          return '→';
        default:
          return key.charAt(0).toUpperCase() + key.slice(1);
      }
    })
    .join(isMac ? '' : '+');
}

/**
 * Default shortcuts for DryJetsOS
 */
export const defaultShortcuts = {
  COMMAND_PALETTE: 'cmd+k',
  TOGGLE_SIDEBAR: 'cmd+b',
  SHOW_HELP: 'cmd+/',
  NEW_ITEM: 'cmd+n',
  SAVE: 'cmd+s',
  SEARCH: 'cmd+f',
  CLOSE: 'esc',
  SYNC_NOW: 'cmd+shift+s',
  REFRESH: 'cmd+r',
};

/**
 * Shortcut categories for help menu
 */
export const shortcutCategories = {
  navigation: 'Navigation',
  actions: 'Actions',
  search: 'Search & Filter',
  general: 'General',
};