/**
 * Test script to verify password hashing works correctly
 * Run with: node test-password-hash.js
 */

// Simulate the hashPassword function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

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

  // Combine salt and hash, then encode as base64
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);

  // Convert to binary string for btoa
  const binaryString = String.fromCharCode(...combined);
  return btoa(binaryString);
}

// Simulate the verifyPassword function
async function verifyPassword(password, storedHash) {
  try {
    const encoder = new TextEncoder();
    // Decode base64 to binary string, then to Uint8Array
    const binaryString = atob(storedHash);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    // Extract salt (first 16 bytes)
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const newHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    // Compare hashes
    const newHashArray = new Uint8Array(newHash);
    if (originalHash.length !== newHashArray.length) return false;

    for (let i = 0; i < originalHash.length; i++) {
      if (originalHash[i] !== newHashArray[i]) return false;
    }

    return true;
  } catch (e) {
    console.error('Verification error:', e);
    return false;
  }
}

// Test the functions
async function testPasswordHashing() {
  const testPassword = 'testpassword123';

  console.log('Testing password hashing...\n');

  // Test 1: Hash a password
  console.log('1. Hashing password:', testPassword);
  const hash = await hashPassword(testPassword);
  console.log('   Hash:', hash);
  console.log('   Hash length:', hash.length, 'characters');
  console.log('');

  // Test 2: Verify correct password
  console.log('2. Verifying correct password...');
  const isValid = await verifyPassword(testPassword, hash);
  console.log('   Result:', isValid ? '✓ VALID' : '✗ INVALID');
  console.log('');

  // Test 3: Verify wrong password
  console.log('3. Verifying wrong password...');
  const isInvalid = await verifyPassword('wrongpassword', hash);
  console.log('   Result:', isInvalid ? '✓ VALID (WRONG!)' : '✗ INVALID (correct)');
  console.log('');

  // Test 4: Verify with empty password
  console.log('4. Verifying empty password...');
  const isEmptyValid = await verifyPassword('', hash);
  console.log('   Result:', isEmptyValid ? '✓ VALID (WRONG!)' : '✗ INVALID (correct)');
  console.log('');

  // Test 5: Verify with corrupted hash
  console.log('5. Verifying with corrupted hash...');
  const corruptedHash = hash.substring(0, hash.length - 5) + 'xxxxx';
  const isCorruptedValid = await verifyPassword(testPassword, corruptedHash);
  console.log('   Result:', isCorruptedValid ? '✓ VALID (WRONG!)' : '✗ INVALID (correct)');
  console.log('');

  // Summary
  console.log('--- Test Summary ---');
  if (isValid && !isInvalid && !isEmptyValid && !isCorruptedValid) {
    console.log('✓ All tests passed! Password hashing is working correctly.');
  } else {
    console.log('✗ Some tests failed!');
    console.log('  - Correct password validation:', isValid ? 'PASS' : 'FAIL');
    console.log('  - Wrong password rejection:', !isInvalid ? 'PASS' : 'FAIL');
    console.log('  - Empty password rejection:', !isEmptyValid ? 'PASS' : 'FAIL');
    console.log('  - Corrupted hash rejection:', !isCorruptedValid ? 'PASS' : 'FAIL');
  }
}

// Run the test
testPasswordHashing().catch(console.error);
