import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader, action } from '../routes/api.page-revisions';

// Mock auth
vi.mock('~/services/auth.server', () => ({
  getAuthFromSession: vi.fn(async () => ({ id: 1, storeId: 123 }))
}));

const mockDb = {
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      all: vi.fn(async () => ({ results: [] })),
      first: vi.fn(async () => null),
      run: vi.fn(async () => ({}))
    }))
  }))
};

const mockContext = { cloudflare: { env: { DB: mockDb } } } as any;

describe('api.page-revisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects loader without pageId', async () => {
    const request = new Request('http://localhost/api/page-revisions');
    const res = await loader({ request, context: mockContext } as any);
    expect(res.status).toBe(400);
  });

  it('returns revisions list when pageId provided', async () => {
    const request = new Request('http://localhost/api/page-revisions?pageId=page-1');
    const res = await loader({ request, context: mockContext } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.revisions).toEqual([]);
  });

  it('creates revision successfully', async () => {
    const request = new Request('http://localhost/api/page-revisions', {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', content: '{}' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await action({ request, context: mockContext } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('rejects POST without content', async () => {
    const request = new Request('http://localhost/api/page-revisions', {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await action({ request, context: mockContext } as any);
    expect(res.status).toBe(400);
  });

  it('returns 404 on restore missing revision', async () => {
    const request = new Request('http://localhost/api/page-revisions?action=restore&id=missing', {
      method: 'POST'
    });

    const res = await action({ request, context: mockContext } as any);
    expect(res.status).toBe(404);
  });

  it('restores revision successfully when found', async () => {
    // mock revision exists
    mockDb.prepare = vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => ({ id: 'rev-1', content: '{}', page_id: 'page-1' })),
        run: vi.fn(async () => ({}))
      }))
    }));

    const request = new Request('http://localhost/api/page-revisions?action=restore&id=rev-1', {
      method: 'POST'
    });

    const res = await action({ request, context: mockContext } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
