/**
 * Vitest Global Setup
 * 
 * This file runs before all tests.
 * Use it for mocking global dependencies or setting up test utilities.
 */

import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

vi.spyOn(console, 'warn').mockImplementation(() => {});

// Mock global fetch to avoid network requests during tests
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  blob: () => Promise.resolve(new Blob()),
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
} as Response);

global.fetch = mockFetch;
window.fetch = mockFetch;

// Global test utilities
export const createMockContext = () => ({
  cloudflare: {
    env: {
      DB: {
        prepare: vi.fn().mockReturnValue({
          bind: vi.fn().mockReturnThis(),
          run: vi.fn().mockResolvedValue({ success: true }),
          first: vi.fn().mockResolvedValue(null),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      },
      RESEND_API_KEY: 'test_resend_key',
      OPENROUTER_API_KEY: 'test_openrouter_key',
    },
    ctx: {
      waitUntil: vi.fn(),
    },
  },
});

export const createMockRequest = (method: string, body?: object, url = 'http://localhost/api/test') => {
  return new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};

// Helper to create mock database results
export const mockDbResult = <T>(data: T[]) => ({
  results: data,
  meta: {},
  success: true,
});

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
