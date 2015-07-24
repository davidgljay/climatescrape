var Deferred = require("promised-io/promise").Deferred,
winston = require('winston'),
request = require("http").request,
logger = new winston.Logger(),
async = require("async"),
elasticHost = '54.85.208.63',
elasticPort = '9200';

//TODO: create custom mappings for elasticsearch so that we can search by url effectively.

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
      logger.error("Error in callback queue" + err);
    } else {
      logger.info("Queue callback complete");
    }
  }
  this.queue.push(task, callback);
}

Elastic.prototype.check = function (url) {
  var deferred = new Deferred();
  console.log("Checking: " + url);
  var post_options = {
    host: elasticHost,
    port: elasticPort,
    path: url,
    method: 'GET'
  };
  var post_req = request(post_options, function(res) {
    var body=''
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('error', function(err) {
      logger.error("Error on exists request:" + err)
    });
    res.on('end', function() {
      if (res.statusCode==200 || res.statusCode == 404){
        deferred.resolve(body);
      } else {
        logger.error('Check call returned status that is neither 200 nor 404:' + res.statusCode);
        deferred.reject(res.statusCode + ":" + res.body);
      }
    })
  }).end();
  return deferred.promise;
}

// Elastic.prototype.exists = function(url) {
//   var deferred = new Deferred();
//   var post_options = {
//       host: elasticHost,
//       port: elasticPort,
//       path: '/cities/_search?q=hash:'+encodeURIComponent(url.hashCode()),
//       method: 'GET'
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
//       if (res.statusCode==200){
//         var result = JSON.parse(body);
//         if (result.hits.total>0) {
//           deferred.resolve(true);
//         } else {
//           deferred.resolve(false);
//         }
//       } else {
//         logger.error('Exists call returned non-200 stattus:' + res.statusCode);
//         deferred.reject(res.statusCode);
//       }
//     })
//   }).end();

//   return deferred.promise;
// }

module.exports = Elastic;