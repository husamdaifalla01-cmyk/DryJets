import { vi } from 'vitest';

/**
 * Mock API Client
 *
 * Provides mocked versions of the API client for testing
 */

export const createMockApiResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

export const createMockApiError = (
  status: number,
  message: string,
  data?: any
) => ({
  response: {
    status,
    data: { message, ...data },
    statusText: '',
    headers: {},
    config: {} as any,
  },
  isAxiosError: true,
  toJSON: () => ({}),
  name: 'AxiosError',
  message,
});

/**
 * Mock Toast Notifications
 */
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  promise: vi.fn(),
};

/**
 * Mock LocalStorage
 */
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
};

/**
 * Setup Test Environment
 */
export const setupTestEnvironment = () => {
  // Mock localStorage
  const mockLocalStorage = createMockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: createMockLocalStorage(),
    writable: true,
  });

  return {
    localStorage: mockLocalStorage,
  };
};

/**
 * Mock Fetch Response
 */
export const createMockFetchResponse = <T>(data: T, options = {}) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob(),
    ...options,
  } as Response);
};

/**
 * Wait for async updates
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
