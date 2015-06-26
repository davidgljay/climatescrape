var winston = require('winston');
var request = require("http").request;
var logger = new winston.Logger();
var async = require("async");
var elasticHost = '54.85.208.63';
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
    var post_req = request(post_options, function(res) {});
    post_req.write(task.data);
    post_req.end(callback);
  }, 40);

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
}

module.exports = Elastic;