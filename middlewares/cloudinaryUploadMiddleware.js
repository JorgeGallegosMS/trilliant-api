const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const cloudinary = require('cloudinary');
const get = require('lodash/get');

const imageService = require('../services/image.service');

module.exports = async (req, res, next) => {
  const file = get(req, 'files[0]');
  
  if (!file) {
    return next();
  }

  const uploadRes = await imageService.uploadToCloudinary(file, 'article');
  req.cloudinaryImageData = uploadRes;
};
