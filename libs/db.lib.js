const mongoose = require('mongoose');

const { MONGODB_URI } = require('../constants/db');

module.exports = () => {
  if (!MONGODB_URI) {
    console.log('No database selected. Please, set MONGODB_URI env variable');
    process.exit(-1);
  }

  return mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false});
<<<<<<< HEAD
};
=======
};
>>>>>>> 29913a960917062e943e3217c609b009609faa8d
