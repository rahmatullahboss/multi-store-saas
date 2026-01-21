import { beforeEach, vi } from 'vitest';

// Mock global fetch for tests
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn() as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});
