import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Resolve 32-byte encryption key from ENCRYPTION_KEY env var
function getEncryptionKey(): Buffer {
  const hexOrBase64 = process.env.ENCRYPTION_KEY;
  if (!hexOrBase64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: ENCRYPTION_KEY environment variable is required in production.');
    }
    // Deterministic dev fallback key for local offline testing (never in production)
    return crypto.scryptSync('dev-fallback-secret-key-salt', 'noor-bayan', 32);
  }
  if (hexOrBase64.length === 64) {
    return Buffer.from(hexOrBase64, 'hex');
  }
  const buf = Buffer.from(hexOrBase64, 'base64');
  if (buf.length === 32) return buf;
  return crypto.scryptSync(hexOrBase64, 'salt', 32);
}

// Password hashing with bcrypt
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// AES-256-GCM Encryption for sensitive records at rest (e.g. IBAN)
export function encryptAtRest(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // iv:tag:ciphertext in base64
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptAtRest(cipherPayload: string): string {
  try {
    const parts = cipherPayload.split(':');
    if (parts.length !== 3) return '';
    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const encrypted = Buffer.from(parts[2], 'base64');
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

// Validate IBAN format and mod-97 checksum
export function isValidIBAN(input: string): boolean {
  const clean = input.replace(/[\s-]/g, '').toUpperCase();
  if (!clean || clean.length < 15 || clean.length > 34) return false;
  // Format check: 2 letters, 2 digits, alphanumeric
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(clean)) return false;

  // Move first 4 characters to end
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  // Convert letters to numbers (A=10, B=11, ... Z=35)
  let numeric = '';
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      numeric += (code - 55).toString();
    } else {
      numeric += ch;
    }
  }

  // Mod-97 on large numbers using chunking
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = remainder.toString() + numeric.substring(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }
  return remainder === 1;
}

// Mask IBAN for safe client display (e.g., SA80****************4589)
export function maskIban(iban: string): string {
  const clean = iban.replace(/[\s-]/g, '').toUpperCase();
  if (clean.length < 8) return clean ? '***' : '';
  const first4 = clean.slice(0, 4);
  const last4 = clean.slice(-4);
  return `${first4} ${'•'.repeat(Math.max(4, clean.length - 8))} ${last4}`;
}
