const sharp = require('sharp');
const { cloudinary } = require('../config/cloudinary');

/**
 * Middleware to process uploaded image buffers with Sharp.
 * Converts images automatically to high-quality WebP format with compression,
 * then uploads them to Cloudinary and attaches public URLs to req.files.
 */
const optimizeAndUploadImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const uploadPromises = req.files.map((file) => {
      return new Promise(async (resolve, reject) => {
        try {
          // Process buffer with Sharp: auto rotate, convert to WebP, quality 82 (lossless feel, compact file size)
          const optimizedBuffer = await sharp(file.buffer)
            .rotate() // auto-orient based on EXIF
            .webp({ quality: 82, effort: 4 })
            .toBuffer();

          // Upload stream to Cloudinary
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'products',
              format: 'webp',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              // Set the Cloudinary URL on file.path so downstream DTOs receive it as before
              file.path = result.secure_url;
              file.filename = result.public_id;
              resolve(result);
            }
          );

          uploadStream.end(optimizedBuffer);
        } catch (err) {
          reject(err);
        }
      });
    });

    await Promise.all(uploadPromises);
    next();
  } catch (error) {
    console.error('Error optimizing and uploading images with Sharp:', error);
    return res.status(500).json({ message: 'Error processing product images', error: error.message });
  }
};

module.exports = optimizeAndUploadImages;
