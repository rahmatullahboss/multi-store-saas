/**
 * E2E Test Data Seeder
 * 
 * Creates test merchant, store, and product for E2E testing.
 * Run after migrations: node db/seeds/seed-e2e.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Test credentials that match fixtures.ts
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123';
const TEST_STORE_NAME = 'E2E Test Store';
const TEST_SUBDOMAIN = 'e2e-test-store';

/**
 * Hash password using PBKDF2 (matching auth.server.ts implementation)
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(16);
  // Use fixed salt for reproducible hash in tests
  for (let i = 0; i < 16; i++) {
    salt[i] = (i * 17 + 42) % 256;
  }
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function seedDatabase() {
  console.log('🌱 Seeding E2E test data...');
  
  try {
    // Generate password hash
    const passwordHash = await hashPassword(TEST_PASSWORD);
    console.log('✅ Generated password hash');
    
    // Build SQL commands
    const storeSQL = `INSERT OR IGNORE INTO stores (id, name, subdomain, created_at) VALUES (1, '${TEST_STORE_NAME}', '${TEST_SUBDOMAIN}', strftime('%s', 'now'));`;
    
    const userSQL = `INSERT OR IGNORE INTO users (id, email, password_hash, name, store_id, role, created_at) VALUES (1, '${TEST_EMAIL}', '${passwordHash}', 'Test Merchant', 1, 'merchant', strftime('%s', 'now'));`;
    
    const productSQL = `INSERT OR IGNORE INTO products (id, store_id, title, price, description, inventory, is_published, created_at) VALUES (1, 1, 'Test Product', 500, 'A test product for E2E testing', 100, 1, strftime('%s', 'now'));`;
    
    // Execute via wrangler d1 execute
    console.log('📦 Creating test store...');
    await execAsync(`npx wrangler d1 execute DB --local --command "${storeSQL}"`);
    
    console.log('👤 Creating test user...');
    await execAsync(`npx wrangler d1 execute DB --local --command "${userSQL}"`);
    
    console.log('📦 Creating test product...');
    await execAsync(`npx wrangler d1 execute DB --local --command "${productSQL}"`);
    
    console.log('✅ E2E seed data created successfully!');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   Store: ${TEST_SUBDOMAIN}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
