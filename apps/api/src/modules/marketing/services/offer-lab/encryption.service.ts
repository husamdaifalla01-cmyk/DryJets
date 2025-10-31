import { Injectable } from '@nestjs/common';
import { createCipher, createDecipher, randomBytes } from 'crypto';

/**
 * Encryption service for sensitive data (API keys, credentials)
 * Uses AES-256-CBC encryption
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.OFFERLAB_ENCRYPTION_KEY || this.generateDefaultKey();

    if (!process.env.OFFERLAB_ENCRYPTION_KEY) {
      console.warn(
        '⚠️  OFFERLAB_ENCRYPTION_KEY not set in environment. Using generated key (not persistent across restarts).',
      );
    }
  }

  /**
   * Encrypt a string value
   */
  encrypt(text: string): string {
    try {
      const iv = randomBytes(16);
      const cipher = createCipher(this.algorithm, this.encryptionKey);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Return IV + encrypted data
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt an encrypted string value
   */
  decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = createDecipher(this.algorithm, this.encryptionKey);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a random encryption key (32 bytes for AES-256)
   */
  private generateDefaultKey(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash a value (one-way) for comparison purposes
   */
  hash(text: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
