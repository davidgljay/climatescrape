var winston = require('winston');
var request = require("http").request;
var logger = new winston.Logger();
var async = require("async");
var elasticHost = 'localhost';
var elasticPort = '9200';

var Elastic = function() {

  this.queue = async.queue(function (task, callback) {
      
    var post_options = {
        host: elasticHost,
        port: elasticPort,
        path: task.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': task.data.length
        }
    };
    var post_req = request(post_options, function(res) {
          res.on('data', function (chunk) {
              console.log('Response: ' + chunk);
          });
    });
    post_req.write(task.data);
    post_req.end(callback);
  }, 10);

}

Elastic.prototype.post = function(path, data) {
  var task = {
    path:path,
    data:data
  };
  var callback = function(err) {
    if (err) {
      logger.error("Error in callback queue" + err);
    } else {
      logger.info("Queue callback complete");
    }
  }
  this.queue.push(task, callback);

  // An object of options to indicate where to post to

  //These are slwoing down, possibly b/c there are too many outbound connections.
  //How to throttle the number of simultaneous requests?
  // Set up the request

}

module.exports = Elastic;