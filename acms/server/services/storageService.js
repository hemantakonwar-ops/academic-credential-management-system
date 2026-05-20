/**
 * Unified Storage Service
 * ─────────────────────────────────────
 * Supports two modes:
 *   1. Cloudinary  – when CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET are set
 *   2. Local disk  – fallback, stores files in server/uploads/
 *
 * Both expose the same three functions: upload, remove, getSignedUrl
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ────────── Cloudinary helpers ──────────
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret'
  );
};

let cloudinary = null;
if (isCloudinaryConfigured()) {
  cloudinary = require('../config/cloudinary');
  console.log('☁️  Storage mode: Cloudinary');
} else {
  console.log('📁 Storage mode: Local disk (uploads/)');
}

// ────────── Local storage setup ──────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!cloudinary) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_RETRIES = 3;

// ────────── Upload ──────────
const uploadFile = async (fileBuffer, originalName, mimetype, retries = 0) => {
  if (cloudinary) {
    // --- Cloudinary upload ---
    return new Promise((resolve, reject) => {
      const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'acms/documents',
          use_filename: false,
          unique_filename: true,
          access_mode: 'authenticated',
        },
        async (error, result) => {
          if (error) {
            if (retries < MAX_RETRIES) {
              console.warn(`Cloudinary upload retry ${retries + 1}/${MAX_RETRIES}`);
              try {
                const retryResult = await uploadFile(fileBuffer, originalName, mimetype, retries + 1);
                resolve(retryResult);
              } catch (retryErr) {
                reject(retryErr);
              }
            } else {
              reject(new Error(`Cloudinary upload failed after ${MAX_RETRIES} retries: ${error.message}`));
            }
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // --- Local disk upload ---
  const ext = path.extname(originalName) || (mimetype === 'application/pdf' ? '.pdf' : '.jpg');
  const uniqueName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);

  await fs.promises.writeFile(filePath, fileBuffer);

  return {
    secure_url: `/uploads/${uniqueName}`,
    public_id: uniqueName,
  };
};

// ────────── Delete ──────────
const deleteFile = async (publicId, resourceType = 'image') => {
  if (cloudinary) {
    try {
      return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      console.error('Cloudinary deletion error:', err.message);
      throw err;
    }
  }

  // --- Local disk delete ---
  const filePath = path.join(UPLOAD_DIR, publicId);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // ignore if already gone
  }
};

// ────────── Get viewable URL ──────────
const getFileUrl = (publicId, resourceType = 'image') => {
  if (cloudinary) {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      secure: true,
    });
  }

  // Local files are served via express.static — return relative path
  return `/uploads/${publicId}`;
};

module.exports = { uploadFile, deleteFile, getFileUrl, isCloudinaryConfigured };
