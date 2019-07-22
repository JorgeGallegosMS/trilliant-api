const multer = require('multer');
const crypto = require('crypto')
const get = require('lodash/get');

const md5 = data => crypto.createHash('md5').update(String(data)).digest('hex');

const { IMAGE_TEMP_DIR } = require('../constants');

const storage = multer.diskStorage({
  destination: IMAGE_TEMP_DIR,
  filename: function(req, file, cb) {
    const fileExt = get(file, 'originalname')
      .split('.')
      .pop();
    const hash = md5(get(file, 'originalname'));
    cb(null, `${hash}-${Date.now()}.${fileExt}`);
  }
});

module.exports = multer({
  dest: IMAGE_TEMP_DIR,
  storage
}).any();
