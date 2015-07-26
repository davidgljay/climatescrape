// // set variables for environment
var express = require('express'),
app = express(), 
path = require('path'),
Site = require('./models/site'),
Firebase = require('firebase'),
async = require('async'),
helper = require('./helper'),
winston = require('winston'),
logger = new winston.Logger(),
db = new Firebase(process.env.FIREBASE_URL).ref();

db.once('value', function(data) {
	var sites = [];
	var sitesToCrawl = {
		'cities':data.child('cities').val(), 
		'media':data.child('media').val(),
		'publications':data.child('publications').val()
	};
	for (subset in sitesToCrawl) {
		for (key in sitesToCrawl[subset]) {
			var data = sitesToCrawl[subset][key];
			sites.push(new Site(data.name, data.url,subset));
		}
	}

	async.eachSeries(sites, 
		function(site, callback) {
			logger.info("Starting: " + site.name + " " + site.url);
			site.crawl(callback);
		},
		function(err) {
		if (err) {
			logger.error("Error crawling sites");
		} else {
			logger.info("City crawling complete");
			process.exit();
		}
	})
});

