var pg = require('pg');
var config = require('config');
var connectionString = config.DATABASE_USERNAME + "://" + config.DATABASE_HOST + ":" + config.DATABASE_PORT + "/" + config.DATABASE_NAME;
var client = new pg.Client(connectionString);
client.connect();
//# sourceMappingURL=db.js.map