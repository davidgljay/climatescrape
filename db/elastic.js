var Deferred = require("promised-io/promise").Deferred,
winston = require('winston'),
request = require("http").request,
logger = new winston.Logger(),
async = require("async");

//Todo: Implement filters in elasticsearch
//TODO: move elastic host and port to environment variables.

var Elastic = function() {

  this.queue = async.queue(function (task, callback) {
      
    var post_options = {
        host: process.env.ELASTIC_HOST,
        port: process.env.ELASTIC_PORT,
        path: task.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': task.data.length
        }
    };
    var post_req = request(post_options, function(res) {
          res.on('error', function(err) {
            logger.error("Error on exists request:" + err)
          });
    });
    post_req.write(task.data);
    post_req.end(callback);
  }, 40);
}

Elastic.prototype.post = function(path, data) {
  logger.info('Posting:' + path);
  var task = {
    path:path,
    data:data
  };
  var callback = function(err) {
    if (err) {
      console.log("Error in callback queue:" + err);
    } else {
      logger.info("Queue callback complete");
    }
  }
  this.queue.push(task, callback);
}

// Elastic.prototype.check = function (url) {
//   var deferred = new Deferred();
//   console.log("Checking: " + url);
//   var post_options = {
//     host: process.env.ELASTIC_HOST,
//     port: process.env.ELASTIC_PORT,
//     path: url,
//     method: 'GET'
//   };
//   var post_req = request(post_options, function(res) {
//     var body=''
//     res.on('data', function (chunk) {
//       body += chunk;
//     });
//     res.on('error', function(err) {
//       logger.error("Error on exists request:" + err)
//     });
//     res.on('end', function() {
//       if (res.statusCode==200 || res.statusCode == 404){
//         deferred.resolve(body);
//       } else {
//         logger.error('Check call returned status that is neither 200 nor 404:' + res.statusCode);
//         deferred.reject(res.statusCode + ":" + res.body);
//       }
//     })
//   }).end();
//   return deferred.promise;
// }

module.exports = Elastic;