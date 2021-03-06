const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

const db = require('./libs/db.lib');
const errorHandler = require('./services/error-handler.service');
const apiRouter = require('./routes/api.route');

const tempImageWorker = require('./workers/tempimage');
const mobileUploadWorker = require('./workers/mobileupload');

const app = express();

db()
  .then(() => {
    app.disable('x-powered-by')
    app.use(
      cors({
        exposedHeaders: ['Content-Range', 'Content-Total', 'X-Total-Count']
      })
    );

    app.use(
      bodyParser.urlencoded({
        extended: false,
        limit: '50mb',
        parameterLimit: 100000
      })
    );

    app.use(
      bodyParser.json({
        limit: '50mb',
        parameterLimit: 100000
      })
    );

    app.use(
      bodyParser.raw({
        limit: '50mb',
        inflate: true,
        parameterLimit: 100000
      })
    );

    app.use(favicon(path.join(__dirname, 'favicon.png')));

    app.use('/api', apiRouter);

    app.use((req, res, next) => {
      const err = {};
      err.message = 'not found';
      err.success = false;
      err.code = 404;
      next(err);
    });

    app.use(errorHandler);

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`App is listening on port: ${port}`);
    });

    tempImageWorker.start();
    mobileUploadWorker.start();
  })
  .catch(err => {
    throw new Error(`Err connecting to the db ${err}`);
  });
