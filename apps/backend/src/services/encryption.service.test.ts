import { describe, it, expect, beforeAll } from 'vitest';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-secret-key-used-only-for-vitest!!!';
  });

  describe('encrypt()', () => {
    it('returns encryptedData, iv, and authTag as hex strings', () => {
      const result = EncryptionService.encrypt('hello world');

      expect(result).toHaveProperty('encryptedData');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result.encryptedData).toMatch(/^[0-9a-f]+$/);
      expect(result.iv).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
      expect(result.authTag).toMatch(/^[0-9a-f]{32}$/); // GCM authTag is 16 bytes
    });

    it('produces a different ciphertext for the same plaintext (random IV)', () => {
      const a = EncryptionService.encrypt('same input');
      const b = EncryptionService.encrypt('same input');

      expect(a.encryptedData).not.toBe(b.encryptedData);
      expect(a.iv).not.toBe(b.iv);
    });

    it('does not leak the plaintext into the ciphertext', () => {
      const plaintext = 'ghp_supersecrettoken_1234567890';
      const { encryptedData } = EncryptionService.encrypt(plaintext);

      expect(encryptedData).not.toContain(plaintext);
      expect(Buffer.from(encryptedData, 'hex').toString('utf8')).not.toContain('ghp_');
    });
  });

  describe('decrypt()', () => {
    it('round-trips a plaintext value', () => {
      const plaintext = 'my-api-key-abc123';
      const { encryptedData, iv, authTag } = EncryptionService.encrypt(plaintext);

      const decrypted = EncryptionService.decrypt(encryptedData, iv, authTag);

      expect(decrypted).toBe(plaintext);
    });

    it('round-trips an empty string', () => {
      const { encryptedData, iv, authTag } = EncryptionService.encrypt('');
      expect(EncryptionService.decrypt(encryptedData, iv, authTag)).toBe('');
    });

    it('round-trips unicode / multibyte input', () => {
      const plaintext = 'مرحبا 🌍 héllo';
      const { encryptedData, iv, authTag } = EncryptionService.encrypt(plaintext);

      expect(EncryptionService.decrypt(encryptedData, iv, authTag)).toBe(plaintext);
    });

    it('throws when the auth tag has been tampered with', () => {
      const { encryptedData, iv, authTag } = EncryptionService.encrypt('secret');

      // Flip one hex character in the authTag
      const tamperedTag =
        (authTag[0] === '0' ? '1' : '0') + authTag.slice(1);

      expect(() =>
        EncryptionService.decrypt(encryptedData, iv, tamperedTag),
      ).toThrow(/Decryption failure/);
    });

    it('throws when the ciphertext has been tampered with', () => {
      const { encryptedData, iv, authTag } = EncryptionService.encrypt('secret');

      const tampered =
        (encryptedData[0] === '0' ? '1' : '0') + encryptedData.slice(1);

      expect(() =>
        EncryptionService.decrypt(tampered, iv, authTag),
      ).toThrow(/Decryption failure/);
    });

    it('throws when the IV does not match the one used for encryption', () => {
      const { encryptedData, authTag } = EncryptionService.encrypt('secret');
      const wrongIv = '00000000000000000000000000000000';

      expect(() =>
        EncryptionService.decrypt(encryptedData, wrongIv, authTag),
      ).toThrow(/Decryption failure/);
    });
  });

  describe('encrypt() / decrypt() — additional edge cases', () => {
    it('round-trips a large (~1 MB) payload', () => {
      const big = 'A'.repeat(1024 * 1024);
      const { encryptedData, iv, authTag } = EncryptionService.encrypt(big);
      expect(EncryptionService.decrypt(encryptedData, iv, authTag)).toBe(big);
    });

    it('round-trips JSON-shaped strings without altering them', () => {
      const plaintext = JSON.stringify({ token: 'ghp_x', nested: { n: 42 } });
      const { encryptedData, iv, authTag } = EncryptionService.encrypt(plaintext);
      expect(EncryptionService.decrypt(encryptedData, iv, authTag)).toBe(plaintext);
    });

    it('produces a different authTag for the same plaintext (depends on IV)', () => {
      const a = EncryptionService.encrypt('payload');
      const b = EncryptionService.encrypt('payload');
      expect(a.authTag).not.toBe(b.authTag);
    });

    it('throws "Decryption failure" — never leaks raw crypto error text', () => {
      try {
        EncryptionService.decrypt('zzzz', 'zzzz', 'zzzz');
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

      expect(EncryptionService.decrypt(a.encryptedData, a.iv, a.authTag)).toBe('alpha');
      expect(EncryptionService.decrypt(b.encryptedData, b.iv, b.authTag)).toBe('beta');
      // And again in reverse order.
      expect(EncryptionService.decrypt(b.encryptedData, b.iv, b.authTag)).toBe('beta');
      expect(EncryptionService.decrypt(a.encryptedData, a.iv, a.authTag)).toBe('alpha');
    });

    it('cannot decrypt a ciphertext produced with a different ENCRYPTION_KEY', () => {
      const original = process.env.ENCRYPTION_KEY;
      const { encryptedData, iv, authTag } = EncryptionService.encrypt('payload');

      process.env.ENCRYPTION_KEY = 'a-completely-different-secret-32bytes!!';
      try {
        expect(() =>
          EncryptionService.decrypt(encryptedData, iv, authTag),
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
