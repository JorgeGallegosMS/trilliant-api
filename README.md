# trilliant-api

## installation
- make sure you have mongodb (4+) installed in your machine. If you have an older version installed, [uninstall it](https://medium.com/@rajanmaharjan/uninstall-mongodb-macos-completely-d2a6d6c163f9) and install a [new version](https://www.mongodb.com/download-center/community)
- Run mongodb
- run `mongo` shell and run `use trilliant` to create a database.
- Create a dump of the staging database from mlab. `mongodump --uri "uri_from_heroku_settings_in_config_vars"`
- cd into the `dump/db__name__here` and run `mongorestore --host 127.0.0.1 --db trilliant .` 

- next, create a `.env` file containing at least (change values if you need to)
```
PORT=5000
MONGODB_URI=mongodb://localhost/trilliant
```
- you can copy the rest from heroku > settings > config vars
- install dependencies using `npm i`
- You should be good to go, `npm run dev`
