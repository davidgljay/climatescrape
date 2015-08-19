// // set variables for environment
var express = require('express'),
app = express(), 
path = require('path'),
Site = require('./models/site'),
Firebase = require('firebase'),
async = require('async'),
helper = require('./helper'),
logger = require('./logger'),
_ = require('underscore'),
db = new Firebase(process.env.FIREBASE_URL).ref();

db.once('value', function(data) {
	var sitesToCrawl = [];

	//Set last_crawled to 0 if it's not yet set.
	data.forEach(function(subset) {
		subset.forEach(function(item) {
			if (!item.hasChild('last_crawled')) {
				item.ref().update({last_crawled:0});
			}
		var siteInfo = item.val();
		siteInfo.ref = item.ref();
		siteInfo.subset = subset.key();
		sitesToCrawl.push(siteInfo);
		})
	})

	// Order sitesToCrawl by last crawl.
	sitesToCrawl = _.sortBy(sitesToCrawl, function(site) {
		return site.last_crawled;
	})

	async.eachSeries(sitesToCrawl, 	
		function(siteInfo, callback) {
			var site = new Site(siteInfo.name, siteInfo.url, siteInfo.subset);
			logger.info("Starting: " + site.name + " " + site.url);

			//Update last_crawled when crawl is complete.
			var cb = function() {
				siteInfo.ref.update({last_crawled:new Date().getTime()});
				callback();
			}

			site.crawl(cb);
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

