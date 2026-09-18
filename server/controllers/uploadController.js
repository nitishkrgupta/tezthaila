import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadImage = async (req, res, next) => {
  try {
    // 1. Multipart form-data upload (via multer)
    if (req.file) {
      const relativeUrl = `/uploads/products/${req.file.filename}`;
      return sendSuccess(res, 201, 'Image uploaded successfully', {
        url: relativeUrl,
        filename: req.file.filename,
        size: req.file.size
      });
    }

    // 2. Base64 JSON payload upload (via webcam camera or canvas snapshot)
    const { image } = req.body;
    if (image && typeof image === 'string' && image.startsWith('data:image/')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return sendError(res, 400, 'Invalid base64 image format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = '.jpg';
      if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('gif')) ext = '.gif';

      const filename = `camera-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);

      const relativeUrl = `/uploads/products/${filename}`;
      return sendSuccess(res, 201, 'Camera photo uploaded successfully', {
        url: relativeUrl,
        filename,
        size: buffer.length
      });
    }

    return sendError(res, 400, 'No image file or camera capture data provided');
  } catch (error) {
    next(error);
  }
};
