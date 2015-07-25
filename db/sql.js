var Deferred = require("promised-io/promise").Deferred,
winston = require('winston'),
request = require("http").request,
logger = new winston.Logger(),
async = require("async");

var SQL = function() {
	this.queue = async.queue(function (query, callback) {
      
	    var post_options = {
        host: process.env.SQL_HOST,
        port: process.env.SQL_PORT,
        path: "/",
        method: 'POST',
        headers: {
            'Content-Type': 'text/html',
            'Content-Length': query.length
        }
    };
    var post_req = request(post_options, function(res) {
          res.on('error', function(err) {
            logger.error("Error on exists SQL post request:" + err)
          });
    });
    post_req.write(query);
    post_req.end(callback);
  }, 40);
};

SQL.prototype.post = function(query) {
  var callback = function(err) {
    if (err) {
      logger.error("Error in SQL async queue: " + err);
    } else {
      logger.info("SQL async queue complete.");
    }
  }
  this.queue.push(query, callback);
}

module.exports = SQL;