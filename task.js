// // set variables for environment
var express = require('express'),
app = express(), 
path = require('path'),
Item = require('./item'),
Firebase = require('firebase'),
async = require('async'),
helper = require('./helper'),
winston = require('winston'),
logger = new winston.Logger(),
db = new Firebase('https://boiling-torch-581.firebaseIO.com/').ref();

db.once('value', function(data) {
	var items = [];
	var sitesToCrawl = {
		'cities':data.child('cities').val(), 
		'media':data.child('media').val(),
		'publications':data.child('publications').val()
	};
	for (subset in sitesToCrawl) {
		for (key in sitesToCrawl[subset]) {
			var data = sitesToCrawl[subset][key];
			items.push(new Item(data.name, data.url,subset));
		}
	}

	async.eachSeries(items, 
		function(item, callback) {
			logger.info("Starting: " + item.name + "item.url");
			item.crawl(callback);
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

