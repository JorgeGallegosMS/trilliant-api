const fs = require('fs');
const path = require('path');

const moment = require('moment');
const cloudinary = require('cloudinary');
const sharp = require('sharp');
const get = require('lodash/get');

const CustomError = require('../libs/custom-error.lib');

const { REVIEW_IMAGE_LIMIT, IMAGE_TEMP_DIR } = require('../constants');
const { TempImageModel } = require('../models/tempimage.model');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports.uploadReviewImagesToCloudinary = async reviewTempId => {
  const images = await TempImageModel.find({ reviewTempId }).lean();

  if (images.length > REVIEW_IMAGE_LIMIT) {
    throw new CustomError({ code: 400, message: 'Too many review images' });
  }

  const imagesUploadData = await Promise.all(
    images
      .map(image => ({
        data: fs.readFileSync(path.join(IMAGE_TEMP_DIR, image.filename)),
        path: path.join(IMAGE_TEMP_DIR, image.filename),
        isThumbnail: image.isThumbnail,
      }))
      .map(async file => {
        const uploadRes = await module.exports.uploadToCloudinary(file, reviewTempId);
        return {
          isThumbnail: file.isThumbnail,
          ...uploadRes,
        }
      })
  );

  images.map(image => {
    try {
      fs.unlinkSync(path.join(IMAGE_TEMP_DIR, image.filename));
    } catch (e) {
      console.error('Failed to remove temp image file', image.filename);
    }
  });

  await TempImageModel.deleteMany({ reviewTempId });

  return imagesUploadData.map(imageUploadData => ({ url: imageUploadData.secure_url, isThumbnail: imageUploadData.isThumbnail }));
};

module.exports.uploadToCloudinary = async (file, tag) => {
  return new Promise((resolve, reject) => {
    return sharp(file.data)
      .resize({ width: 500, fit: 'contain' })
      .toFile(file.path)
      .then(fileData => {
        cloudinary.v2.uploader.upload(
          file.path,
          {
            folder: 'trilliant',
            tags: [tag]
          },

          function(error, result) {
            if (error) {
              return reject(new Error('something wrong with uploading to cloud'));
            }
            resolve(result);
          }
        );
      })
      .catch(reject);
  });
};

module.exports.deleteTempImageById = async imageId => {
  try {
    const image = await TempImageModel.findById(imageId);
    if (!image) {
      throw new CustomError({
        code: 404
      });
    }
    try {
      fs.unlinkSync(path.join(IMAGE_TEMP_DIR, image.filename));
    } catch (e) {
      console.error('Failed to remove temp image file', image.filename);
    }
    return await TempImageModel.deleteOne({ _id: imageId });
  } catch (err) {
    throw new CustomError({
      message: err.message
    });
  }
};

module.exports.deleteTempImagesByReviewTempId = async reviewTempId => {
  const images = await TempImageModel.find({ reviewTempId }).lean();

  images.map(image => {
    try {
      fs.unlinkSync(path.join(IMAGE_TEMP_DIR, image.filename));
    } catch (e) {
      console.error('Failed to remove temp image file', image.filename);
    }
  });

  return TempImageModel.deleteMany({ reviewTempId });
};

module.exports.saveTempImageData = async data => {
  try {
    return await TempImageModel.create(data);
  } catch (err) {
    throw new CustomError({
      message: err.message
    });
  }
};

module.exports.clearTempReviewImageData = async reviewTempId => {
  try {
    return await TempImageModel.deleteMany({ reviewTempId });
  } catch (err) {
    throw new CustomError({
      message: err.message
    });
  }
};

module.exports.clearOldImageData = async reviewTempId => {
  try {
    const olderThan = moment()
      .subtract(1, 'days')
      .toDate();
    return await TempImageModel.deleteMany({ createdAt: { $lte: olderThan } });
  } catch (err) {
    throw new CustomError({
      message: err.message
    });
  }
};

module.exports.uploadProfilePictureToCloudinary = async file => {
  const uploadedImage = await cloudinary.v2.uploader.upload(file)
  return uploadedImage.secure_url
}
