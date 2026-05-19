const cloudinary = require('../config/cloudinary');

const MAX_RETRIES = 3;

const uploadToCloudinary = async (fileBuffer, originalName, mimetype, retries = 0) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'acms/documents',
        use_filename: false,
        unique_filename: true,
        access_mode: 'authenticated', // signed URL required to access
      },
      async (error, result) => {
        if (error) {
          if (retries < MAX_RETRIES) {
            console.warn(`Cloudinary upload retry ${retries + 1}/${MAX_RETRIES}`);
            try {
              const retryResult = await uploadToCloudinary(fileBuffer, originalName, mimetype, retries + 1);
              resolve(retryResult);
            } catch (retryErr) {
              reject(retryErr);
            }
          } else {
            reject(new Error(`Cloudinary upload failed after ${MAX_RETRIES} retries: ${error.message}`));
          }
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary deletion error:', err.message);
    throw err;
  }
};

const getSignedUrl = (publicId, resourceType = 'image') => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    secure: true,
  });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, getSignedUrl };
