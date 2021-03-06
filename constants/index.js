const path = require('path');
const fs = require('fs');

module.exports = {
  IMAGE_TEMP_DIR: path.join(__dirname, '../upload'),
  REVIEW_IMAGE_LIMIT: 20,
};

if (!fs.existsSync(module.exports.IMAGE_TEMP_DIR)) {
  fs.mkdirSync(module.exports.IMAGE_TEMP_DIR);
}
