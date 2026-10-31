import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { HttpStatus } from '../../shared/constants/httpStatus.js';
import { BadRequestError } from '../../shared/errors/AppError.js';
import { ErrorCodes } from '../../shared/constants/errorCodes.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class UploadController {
  /**
   * Upload image via Base64 or JSON payload (Cattle photos, expense receipts, profile avatars)
   */
  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { image, filename, category = 'general' } = req.body;

      if (!image) {
        throw new BadRequestError('Base64 image data string is required.', ErrorCodes.VALIDATION_ERROR);
      }

      // Extract mime type and clean base64 data
      const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let buffer: Buffer;
      let extension = 'jpg';

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];

        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
          throw new BadRequestError('Only JPG, PNG, WEBP, and GIF images are permitted.', ErrorCodes.VALIDATION_ERROR);
        }

        extension = mimeType.split('/')[1] || 'jpg';
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        // Fallback for raw base64 string
        buffer = Buffer.from(image, 'base64');
      }

      // Max 5MB limit
      if (buffer.length > 5 * 1024 * 1024) {
        throw new BadRequestError('Image size exceeds 5MB limit.', ErrorCodes.VALIDATION_ERROR);
      }

      const randomId = crypto.randomBytes(8).toString('hex');
      const safeFilename = `${category}-${Date.now()}-${randomId}.${extension}`;
      const filePath = path.join(UPLOAD_DIR, safeFilename);

      await fs.promises.writeFile(filePath, buffer);

      const host = req.get('host') || 'localhost:5001';
      const protocol = req.protocol || 'http';
      const publicUrl = `${protocol}://${host}/uploads/${safeFilename}`;

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Image uploaded successfully.',
        data: {
          filename: safeFilename,
          url: publicUrl,
          sizeBytes: buffer.length,
          category,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
