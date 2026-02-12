import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { loader as createOrderLoader } from '~/routes/api.create-order';
import { loader as uploadImageLoader } from '~/routes/api.upload-image';

type OpenApiDoc = {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, Record<string, unknown>>;
};

function readOpenApiDoc(): OpenApiDoc {
  const specPath = path.resolve(process.cwd(), '../../docs/openapi.yaml');
  const raw = readFileSync(specPath, 'utf8');
  return parse(raw) as OpenApiDoc;
}

describe('OpenAPI contract', () => {
  it('has required metadata and key active paths', () => {
    const doc = readOpenApiDoc();

    expect(doc.openapi).toBe('3.1.0');
    expect(doc.info.title).toBe('Multi-Store SaaS API');
    expect(doc.info.version).toBe('2026-02-12');

    const requiredPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/logout',
      '/api/create-order',
      '/api/upload-image',
      '/api/webhook/sslcommerz',
      '/api/v1/products',
      '/api/v1/orders',
      '/api/v1/orders/{id}',
    ];

    for (const p of requiredPaths) {
      expect(doc.paths[p], `Missing path in OpenAPI: ${p}`).toBeDefined();
    }
  });

  it('uses unique operationIds and secure API-key paths', () => {
    const doc = readOpenApiDoc();
    const operationIds: string[] = [];

    for (const [routePath, operations] of Object.entries(doc.paths)) {
      for (const [method, op] of Object.entries(operations)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          const operation = op as { operationId?: string; security?: unknown[] };
          expect(operation.operationId, `Missing operationId for ${method.toUpperCase()} ${routePath}`).toBeTruthy();
          operationIds.push(operation.operationId as string);

          if (routePath.startsWith('/api/v1/')) {
            const security = operation.security ?? [];
            expect(
              security,
              `${method.toUpperCase()} ${routePath} must require bearerAuth`
            ).toEqual(expect.arrayContaining([expect.objectContaining({ bearerAuth: [] })]));
          }
        }
      }
    }

    expect(new Set(operationIds).size).toBe(operationIds.length);
  });
});

describe('Method contract behavior', () => {
  it('enforces POST only for create-order', async () => {
    const response = await createOrderLoader();
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });

  it('enforces POST only for upload-image', async () => {
    const response = await uploadImageLoader();
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });
});
