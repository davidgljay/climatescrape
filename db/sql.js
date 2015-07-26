var Deferred = require("promised-io/promise").Deferred,
winston = require('winston'),
request = require("http").request,
logger = new winston.Logger(),
async = require("async")
mysql = require("mysql");

var SQL = function() {
  var self = this;
    self.connection = mysql.createConnection({
      host     : process.env.SQL_HOST,
      port     : process.env.SQL_PORT,
      user     : process.env.SQL_USER,
      password : process.env.SQL_PWD,
      database : process.env.SQL_DB
    });

    self.connection.connect(function(err) {
      if (err) {
        logger.error('error connecting: ' + err.stack);
        return;
      }
     
      logger.info('SQL connected as id ' + connection.threadId);
    });
};

SQL.prototype.post = function(query) {
  var self = this;
  self.connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    logger.info('Got sql return: ', rows[0].solution);
  });   
}

module.exports = SQL;