const CronJob = require('cron').CronJob;

const tempimageService = require('../services/image.service');

const cleanTempImageDataJob = new CronJob(
  '00 00 00 * * *',
  function() {
    tempimageService.clearOldImageData();
  },
  null,
  true,
  'America/Los_Angeles'
);

module.exports.start = () => {
  console.log('Temp Image worker started')
  cleanTempImageDataJob.start();
}


