var mysql = require("mysql"),
logger = require('../logger.js');

var SQL = function() {
  var self = this;
  var connectionVars = {
      host     : process.env.SQL_HOST,
      port     : process.env.SQL_PORT,
      user     : process.env.SQL_USER,
      password : process.env.SQL_PWD,
      database : process.env.SQL_DB,
      ssl      : "Amazon RDS"
    };

  self.connection = mysql.createConnection(connectionVars);

  self.connection.connect(function(err) {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      return;
    }
   
    logger.info('SQL connected as id ' + self.connection.threadId);
  });
};

SQL.prototype.post = function(query) {
  var self = this;
  self.connection.query(query, function(err, rows, fields) {
    if (err) {
      logger.error("Error in SQL query: " + err);
      logger.error("Query was:" + query);
    }
  });   
}

module.exports = SQL;