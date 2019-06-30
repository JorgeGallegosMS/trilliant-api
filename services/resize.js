const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const cloudinary = require("cloudinary");
const get = require("lodash/get");

const { IMAGE_TEMP_DIR } = require("../constants");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports.resizeAndSave = (req, res, next) => {
  const file = get(req, "files['file']");
  if (!file) {
    return next();
  }
  const newName = file.name;

  const filepath = path.join(IMAGE_TEMP_DIR, newName);

  sharp(file.data)
    .resize({ width: 500, fit: "contain" })
    .toFile(filepath)
    .then(i => {
      cloudinary.v2.uploader.upload(
        filepath,
        {
          folder: "trilliant",
          filename: function(req, file, cb) {
            console.log(file, "FILE");
            cb(null, file.originalname + Date.now().toString());
          }
        },

        function(error, result) {
          if (error) {
            console.log("*err*", error);
            throw new Error("something wrong in uploading to cloud");
          }
          req.result = result;
          fs.unlink(filepath, err => {
            if (err) console.log("can't del file");
          });
          next();
        }
      );
    })
    .catch(err => console.log("err:", err.message));
};
