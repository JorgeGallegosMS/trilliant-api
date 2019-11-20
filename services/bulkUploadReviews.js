const parseC = require("csv-parse");
const fs = require("fs");
const unzipper = require("unzipper");
const util = require("util");
const cloudinary = require("cloudinary");
const streamToPromise = require("stream-to-promise");
const readDir = require("recursive-readdir");

const {
  merge,
  map,
  filter,
  groupBy,
  reduce,
  mergeMap,
  tap
} = require("rxjs/operators");
const { toPromise, Observable, bindNodeCallback, from } = require("rxjs");
// require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const readFile = util.promisify(fs.readFile);
const parse = util.promisify(parseC);

const uploader = cloudinary.v2.uploader;
const uploadStream = bindNodeCallback(uploader.upload);

module.exports = bulkUploadReviews;
function createStreamToRx(data, error, close, end) {
  return function streamToRx(stream) {
    return new Observable(subscriber => {
      const endHandler = () => subscriber.complete();
      const errorHandler = e => subscriber.error(e);
      const dataHandler = data => subscriber.next(data);
      stream.addListener(end, endHandler);
      stream.addListener(close, endHandler);
      stream.addListener(error, errorHandler);
      stream.addListener(data, dataHandler);
      return () => {
        stream.removeListener(end, endHandler);
        stream.removeListener(close, endHandler);
        stream.removeListener(error, errorHandler);
        stream.removeListener(data, dataHandler);
      };
    });
  };
}
async function bulkUploadReviews(files) {
  return new Promise(async (resolve, reject) => {
    try {
      const zipFile = files.find(({ fieldname }) => fieldname === "zipFile");
      const csvFile = files.find(({ fieldname }) => fieldname === "csvFile");
      // extract all files to a folder
      const csvInput = await readFile(csvFile.path);
      const errors = {
        1: {
          ids: [],
          name: "Folders without a corresponding row in the csv file",
          code: 1
        },
        2: {
          ids: [],
          name:
            "Rows without a corresponding folder in the zip file (the review was ignored and nothing was created.)",
          code: 2
        }
      };
      const reviews = await parse(csvInput, {
        columns: true,
        skip_empty_lines: true
      });

      const unzipStream = fs
        .createReadStream(zipFile.path)
        .pipe(unzipper.Parse());
      const extractStream = fs
        .createReadStream(zipFile.path)
        .pipe(unzipper.Extract({ path: "./bulk" }));

      const res = await extractStream.promise();
      //const unzipped$ = createStreamToRx("entry", "error", "finish", "close")(
      //  unzipStream
      // );
      const unzipped$ = bindNodeCallback(readDir);

      const filterFiles = filter(({ type }) => type === "File");

      const groupFilesByParentDirectory = groupBy(path => path.split("/")[1]);

      const uploadEachStreamOfFiles = mergeMap(group$ =>
        group$.pipe(
          map(path => {
            // unzipping specific function
            return bindNodeCallback(uploader.upload)(path);
          }),
          mergeMap(upload$ =>
            // each file upload in a separate stream
            upload$.pipe(
              reduce((acc, item) => ({ ...acc, ...item }), {
                reviewId: group$.key
              })
            )
          )
        )
      );
      const result = [];
      from(["./bulk"])
        .pipe(map(path => unzipped$(path)))
        // trannsform a single array to an observable that emits each elem at once
        // and flatten it again -__-
        .pipe(mergeMap(x$ => x$))
        .pipe(map(x => from(x)))
        .pipe(mergeMap(x$ => x$))
        .pipe(groupFilesByParentDirectory, uploadEachStreamOfFiles)
        .subscribe(
          x => {
            const itemReviewId = x.reviewId;
            const review = reviews.find(
              ({ reviewID }) => reviewID === itemReviewId
            );
            if (!review) {
              errors[1].ids.push(itemReviewId);
              return;
            }
            const reviewIndexInResult = result.findIndex(
              ({ reviewID }) => reviewID === itemReviewId
            );
            if (reviewIndexInResult < 0) {
              result.push({ ...review, imageUrls: [x] });
              return;
            }
            result[reviewIndexInResult].imageUrls.push(x);
          },
          err => reject(err),
          () => {
            const reviewsWithoutImages = reviews.filter(review => {
              return (
                result
                  .map(({ reviewId }) => reviewId)
                  .indexOf(review.reviewID) < 0
              );
            });
            errors[2].ids = reviewsWithoutImages;
            resolve({ result, errors });
          }
        );
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
  });
}
// bulkUploadReviews([
//   { fieldname: "zipFile", path: "/Users/ma/Downloads/imgs/images.zip" },
//   { fieldname: "csvFile", path: "/Users/ma/Downloads/imgs/r.csv" }
// ]);
