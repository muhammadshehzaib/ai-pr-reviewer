import { describe, it, expect, beforeAll } from 'vitest';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-secret-key-used-only-for-vitest!!!';
  });

  describe('encrypt()', () => {
    it('returns encryptedData, iv, authTag, and salt as hex strings', () => {
      const result = EncryptionService.encrypt('hello world');

      expect(result).toHaveProperty('encryptedData');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('salt');
      expect(result.encryptedData).toMatch(/^[0-9a-f]+$/);
      expect(result.iv).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
      expect(result.authTag).toMatch(/^[0-9a-f]{32}$/); // GCM authTag is 16 bytes
      expect(result.salt).toMatch(/^[0-9a-f]{32}$/); // 16-byte salt
    });

    it('produces a different ciphertext for the same plaintext (random IV)', () => {
      const a = EncryptionService.encrypt('same input');
      const b = EncryptionService.encrypt('same input');

      expect(a.encryptedData).not.toBe(b.encryptedData);
      expect(a.iv).not.toBe(b.iv);
    });

    it('produces a different salt for each encryption (per-record key derivation)', () => {
      const a = EncryptionService.encrypt('same input');
      const b = EncryptionService.encrypt('same input');

      expect(a.salt).not.toBe(b.salt);
    });

    it('does not leak the plaintext into the ciphertext', () => {
      const plaintext = 'ghp_supersecrettoken_1234567890';
      const { encryptedData } = EncryptionService.encrypt(plaintext);

      expect(encryptedData).not.toContain(plaintext);
      expect(Buffer.from(encryptedData, 'hex').toString('utf8')).not.toContain('ghp_');
    });

    it('throws when ENCRYPTION_KEY is missing', () => {
      const original = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;
      try {
        expect(() => EncryptionService.encrypt('x')).toThrow(/ENCRYPTION_KEY/);
      } finally {
        process.env.ENCRYPTION_KEY = original;
      }
    });
  });

  describe('decrypt()', () => {
    it('round-trips a plaintext value', () => {
      const plaintext = 'my-api-key-abc123';
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt(plaintext);

      const decrypted = EncryptionService.decrypt(encryptedData, iv, authTag, salt);

      expect(decrypted).toBe(plaintext);
    });

    it('round-trips an empty string', () => {
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt('');
      expect(EncryptionService.decrypt(encryptedData, iv, authTag, salt)).toBe('');
    });

    it('round-trips unicode / multibyte input', () => {
      const plaintext = 'مرحبا 🌍 héllo';
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt(plaintext);

      expect(EncryptionService.decrypt(encryptedData, iv, authTag, salt)).toBe(plaintext);
    });

    it('throws when the auth tag has been tampered with', () => {
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt('secret');

      // Flip one hex character in the authTag
      const tamperedTag =
        (authTag[0] === '0' ? '1' : '0') + authTag.slice(1);

      expect(() =>
        EncryptionService.decrypt(encryptedData, iv, tamperedTag, salt),
      ).toThrow(/Decryption failure/);
    });

    it('throws when the ciphertext has been tampered with', () => {
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt('secret');

      const tampered =
        (encryptedData[0] === '0' ? '1' : '0') + encryptedData.slice(1);

      expect(() =>
        EncryptionService.decrypt(tampered, iv, authTag, salt),
      ).toThrow(/Decryption failure/);
    });

    it('throws when the IV does not match the one used for encryption', () => {
      const { encryptedData, authTag, salt } = EncryptionService.encrypt('secret');
      const wrongIv = '00000000000000000000000000000000';

      expect(() =>
        EncryptionService.decrypt(encryptedData, wrongIv, authTag, salt),
      ).toThrow(/Decryption failure/);
    });

    it('throws when the salt does not match the one used for encryption', () => {
      const { encryptedData, iv, authTag } = EncryptionService.encrypt('secret');
      const wrongSalt = '0000000000000000000000000000000a';

      expect(() =>
        EncryptionService.decrypt(encryptedData, iv, authTag, wrongSalt),
      ).toThrow(/Decryption failure/);
    });
  });

  describe('encrypt() / decrypt() — additional edge cases', () => {
    it('round-trips a large (~1 MB) payload', () => {
      const big = 'A'.repeat(1024 * 1024);
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt(big);
      expect(EncryptionService.decrypt(encryptedData, iv, authTag, salt)).toBe(big);
    });

    it('round-trips JSON-shaped strings without altering them', () => {
      const plaintext = JSON.stringify({ token: 'ghp_x', nested: { n: 42 } });
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt(plaintext);
      expect(EncryptionService.decrypt(encryptedData, iv, authTag, salt)).toBe(plaintext);
    });

    it('produces a different authTag for the same plaintext (depends on IV)', () => {
      const a = EncryptionService.encrypt('payload');
      const b = EncryptionService.encrypt('payload');
      expect(a.authTag).not.toBe(b.authTag);
    });

    it('throws "Decryption failure" — never leaks raw crypto error text', () => {
      try {
        EncryptionService.decrypt('zzzz', 'zzzz', 'zzzz', 'zzzz');
        expect.unreachable('decrypt should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe(
          'Decryption failure - key may be compromised or invalid.',
        );
      }
    });

    it('decryption of one ciphertext is independent of others (no shared state)', () => {
      const a = EncryptionService.encrypt('alpha');
      const b = EncryptionService.encrypt('beta');

      expect(EncryptionService.decrypt(a.encryptedData, a.iv, a.authTag, a.salt)).toBe('alpha');
      expect(EncryptionService.decrypt(b.encryptedData, b.iv, b.authTag, b.salt)).toBe('beta');
      // And again in reverse order.
      expect(EncryptionService.decrypt(b.encryptedData, b.iv, b.authTag, b.salt)).toBe('beta');
      expect(EncryptionService.decrypt(a.encryptedData, a.iv, a.authTag, a.salt)).toBe('alpha');
    });

    it('cannot decrypt a ciphertext produced with a different ENCRYPTION_KEY', () => {
      const original = process.env.ENCRYPTION_KEY;
      const { encryptedData, iv, authTag, salt } = EncryptionService.encrypt('payload');

      process.env.ENCRYPTION_KEY = 'a-completely-different-secret-32bytes!!';
      try {
        expect(() =>
          EncryptionService.decrypt(encryptedData, iv, authTag, salt),
        ).toThrow(/Decryption failure/);
      } finally {
        process.env.ENCRYPTION_KEY = original;
      }
    });

    it('uses 16-byte IV (AES-GCM standard)', () => {
      const { iv } = EncryptionService.encrypt('x');
      expect(Buffer.from(iv, 'hex')).toHaveLength(16);
    });

    it('produces ciphertext length proportional to plaintext length (GCM is stream-like)', () => {
      const short = EncryptionService.encrypt('a');
      const long = EncryptionService.encrypt('a'.repeat(100));
      // Hex doubles byte count; plaintext 1 vs 100 → ciphertext 2 vs 200 hex chars.
      expect(long.encryptedData.length).toBeGreaterThan(short.encryptedData.length);
    });
  });
});
