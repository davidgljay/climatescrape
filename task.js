// // set variables for environment
var express = require('express'),
app = express(), 
path = require('path'),
City = require('./city'),
Firebase = require('firebase'),
async = require('async'),
winston = require('winston'),
logger = new winston.Logger(),
db = new Firebase('https://boiling-torch-581.firebaseIO.com/').ref();

db.once('value', function(data) {
	var cities = [];
	var citiesdata = data.child('cities').val();
	for (key in citiesdata) {
		var citydata = citiesdata[key];
		cities.push(new City(citydata.name, citydata.url));
	}
	async.eachSeries(cities, function(city, callback) {
		console.log(city.url);
		city.crawl(callback);
	},
	function(err) {
		if (err) {
			logger.error("Error crawling cities");
		} else {
			logger.info("City crawling complete");
			process.exit();
		}
	})
});

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

// app.get('/', function(req, res) {
//   res.render('index');
// });

// app.get('/nyc', function(req, res) {
  
// })

// Set server port
// app.listen(4000);
// console.log('server is running');