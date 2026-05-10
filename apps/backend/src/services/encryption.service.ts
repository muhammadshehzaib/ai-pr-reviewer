import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';

  private static getSecretKey(): Buffer {
    const rawKey = process.env.ENCRYPTION_KEY || 'fallback-dev-key-ensure-32-bytes-long!!!';
    return scryptSync(rawKey, 'salt', 32);
  }

  static encrypt(text: string): { encryptedData: string; iv: string; authTag: string } {
    try {
      const iv = randomBytes(16);
      const key = this.getSecretKey();
      const cipher = createCipheriv(this.ALGORITHM, key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag,
      };
    } catch (error) {
      console.error('Encryption Error:', error);
      throw new Error('Encryption failure occurred');
    }
  }

  static decrypt(encryptedData: string, ivHex: string, authTagHex: string): string {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const key = this.getSecretKey();
      const decipher = createDecipheriv(this.ALGORITHM, key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption Error:', error);
      throw new Error('Decryption failure - key may be compromised or invalid.');
    }
  }
}
