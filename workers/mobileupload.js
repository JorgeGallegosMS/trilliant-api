const CronJob = require('cron').CronJob;

const MobileCodesModel = require('../models/mobilecodes.model');

const cleanTempImageDataJob = new CronJob(
  '00 10 00 * * *',
  function() {
    MobileCodesModel.removeOldCodes();
  },
  null,
  true,
  'America/Los_Angeles'
);

module.exports.start = () => {
  console.log('MobileCodesRemoveOld worker started')
  cleanTempImageDataJob.start();
}


