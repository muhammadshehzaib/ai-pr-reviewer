import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256-bit key
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 16;

  /**
   * Reads the master key from the environment. There is deliberately NO
   * fallback: a missing/weak ENCRYPTION_KEY must fail loudly at the boundary
   * rather than silently encrypting everything under a known dev value.
   */
  private static getMasterKey(): string {
    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey || rawKey.length < 16) {
      throw new Error(
        'ENCRYPTION_KEY is missing or too short (min 16 chars). Refusing to operate the vault with an insecure key.',
      );
    }
    return rawKey;
  }

  /**
   * Derive a 256-bit key from the master key and a per-record salt. A unique
   * salt per record means the same ENCRYPTION_KEY never produces the same
   * derived key twice, which defeats precomputation across records.
   */
  private static deriveKey(salt: Buffer): Buffer {
    return scryptSync(this.getMasterKey(), salt, this.KEY_LENGTH);
  }

  static encrypt(text: string): {
    encryptedData: string;
    iv: string;
    authTag: string;
    salt: string;
  } {
    try {
      const salt = randomBytes(this.SALT_LENGTH);
      const iv = randomBytes(this.IV_LENGTH);
      const key = this.deriveKey(salt);
      const cipher = createCipheriv(this.ALGORITHM, key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag,
        salt: salt.toString('hex'),
      };
    } catch (error) {
      // Let configuration errors (missing key) surface as-is.
      if (error instanceof Error && error.message.startsWith('ENCRYPTION_KEY')) throw error;
      console.error('Encryption Error:', error);
      throw new Error('Encryption failure occurred');
    }
  }

  static decrypt(
    encryptedData: string,
    ivHex: string,
    authTagHex: string,
    saltHex: string,
  ): string {
    try {
      const salt = Buffer.from(saltHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const key = this.deriveKey(salt);
      const decipher = createDecipheriv(this.ALGORITHM, key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('ENCRYPTION_KEY')) throw error;
      console.error('Decryption Error:', error);
      throw new Error('Decryption failure - key may be compromised or invalid.');
    }
  }
}
