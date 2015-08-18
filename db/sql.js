var Deferred = require("promised-io/promise").Deferred,
winston = require('winston'),
logger = new winston.Logger(),
mysql = require("mysql");

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
      console.log('error connecting: ' + err.stack);
      return;
    }
   
    console.log('SQL connected as id ' + self.connection.threadId);
  });
};

SQL.prototype.post = function(query) {
  var self = this;
  self.connection.query(query, function(err, rows, fields) {
    if (err) {
      console.log("Error in SQL query: " + err);
      console.log("Query was:" + query);
    }
  });   
}

module.exports = SQL;