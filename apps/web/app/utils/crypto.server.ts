/**
 * AES-GCM encryption/decryption utilities for sensitive credentials.
 * Uses the Web Crypto API — works in Cloudflare Workers and Node.js 18+.
 *
 * Key: a 32-byte (256-bit) secret, base64-encoded.
 *   Generate with: openssl rand -base64 32
 *   Store as: wrangler secret put COURIER_ENCRYPT_KEY
 *
 * Encrypted format stored in DB: "<ivBase64>:<ciphertextBase64>"
 */

function b64encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function b64decode(str: string): Uint8Array<ArrayBuffer> {
  const raw = atob(str);
  const buf = new Uint8Array(raw.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
}

async function importKey(keyBase64: string, usage: 'encrypt' | 'decrypt') {
  const keyBytes = b64decode(keyBase64);
  return crypto.subtle.importKey('raw', keyBytes.buffer as ArrayBuffer, { name: 'AES-GCM' }, false, [usage]);
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a string in the format: "<ivBase64>:<ciphertextBase64>"
 */
export async function encryptSecret(plaintext: string, keyBase64: string): Promise<string> {
  const key = await importKey(keyBase64, 'encrypt');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded.buffer as ArrayBuffer);
  return `${b64encode(iv)}:${b64encode(new Uint8Array(ciphertext))}`;
}

/**
 * Decrypts a value encrypted with encryptSecret().
 * Returns the original plaintext string.
 */
export async function decryptSecret(encrypted: string, keyBase64: string): Promise<string> {
  const [ivB64, ctB64] = encrypted.split(':');
  if (!ivB64 || !ctB64) throw new Error('Invalid encrypted format');
  const key = await importKey(keyBase64, 'decrypt');
  const iv = b64decode(ivB64);
  const ciphertext = b64decode(ctB64);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength) as ArrayBuffer
  );
  return new TextDecoder().decode(plaintext);
}

/**
 * Returns true if the value looks like an encrypted blob (iv:ciphertext).
 * Used to avoid double-encrypting on re-save.
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}
