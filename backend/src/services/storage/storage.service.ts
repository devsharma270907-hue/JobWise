import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { encrypt, decrypt } from '../../utils/encryption.js';
import { logger } from '../../utils/logger.js';

export interface SavedFile {
  fileKey: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<SavedFile> {
    const fileExt = path.extname(file.originalname);
    const uniqueKey = `${crypto.randomUUID()}${fileExt}.enc`;
    const targetPath = path.join(this.uploadDir, uniqueKey);

    // Encrypt file content with AES-256-GCM before saving to disk/storage
    const encryptedContent = encrypt(file.buffer.toString('base64'));
    await fs.promises.writeFile(targetPath, encryptedContent, 'utf8');

    logger.info('File securely stored with AES-256-GCM encryption', {
      fileKey: uniqueKey,
      size: file.size,
    });

    return {
      fileKey: uniqueKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async readFileBuffer(fileKey: string): Promise<Buffer> {
    const targetPath = path.join(this.uploadDir, fileKey);
    if (!fs.existsSync(targetPath)) {
      throw new Error(`File not found: ${fileKey}`);
    }

    const encryptedData = await fs.promises.readFile(targetPath, 'utf8');
    const decryptedBase64 = decrypt(encryptedData);
    return Buffer.from(decryptedBase64, 'base64');
  }

  async deleteFile(fileKey: string): Promise<void> {
    const targetPath = path.join(this.uploadDir, fileKey);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      logger.info('File securely deleted from storage', { fileKey });
    }
  }
}

export const storageService = new StorageService();
