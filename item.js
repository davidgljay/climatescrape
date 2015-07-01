var Deferred = require("promised-io/promise").Deferred;
var winston = require('winston');
var logger = new winston.Logger();
var unfluff = require('unfluff');
var Elastic = require("./elastic");
var elastic = new Elastic();
logger.add(winston.transports.Console);

var Item = function(name, url,type) {
	this.name = name;
	this.type = type;
	if (url.substring(0,6)=="http://") {
		this.url = url;
	} else {
		this.url = "http://" + url; 
	}
	//Extracing item code form url. In principal this could create conflicts, but I think I'm ok...
	this.code = url.split('.').reverse()[1];
};

var starttime = new Date().getTime();

Item.prototype.crawl = function(callback) {
	var self=this;
	var deferred = new Deferred();
	var Crawler = require("simplecrawler");
	var itemcrawler = new Crawler(this.url); 
	itemcrawler.interval = 100;
	itemcrawler.maxResourceSize = 1000000;
	itemcrawler.scanSubdomains = true;
	itemcrawler.on("fetchcomplete", function(queueItem,responseBuffer, response){
		var strip_options = {
		    include_script : false,
		    include_style : false,
		    compact_whitespace : true,
		  include_attributes : { 'alt': true }
		};
		if (queueItem.stateData.contentType.substring(0,9)=="text/html") {
			var cleanResponse = unfluff(responseBuffer.toString('utf-8'),'en');
			var post_data = {
				title: cleanResponse.title,
				body: cleanResponse,
				item_code: self.code,
				url: queueItem.url,
				item_name: self.name,
				fetched_on: new Date().getTime(),
				hash: queueItem.url.hashCode()
			};
			elastic.exists(queueItem.url)
				.then(function(exists) {
					if (!exists) {
						logger.info("New page found, fetching:" + queueItem.url);
						elastic.post('/' + item + '/' + self.code ,JSON.stringify(post_data))
					}
				});
		}
	},
	function(queueItem) {
		logger.error("Error fetching: " + queueItem.url);
	});
	itemcrawler.addFetchCondition(function(parsedUrl) {
		return (
			!parsedUrl.path.match(/\.js$/i) && 
			!parsedUrl.path.match(/\.css$/i) &&
			!parsedUrl.path.match(/\.png$/i) &&
			!parsedUrl.path.match(/\.jpg$/i) &&
			!parsedUrl.path.match(/\.bmp$/i) &&
			!parsedUrl.path.match(/\.gif$/i) &&
			!parsedUrl.path.match(/\.pdf$/i) &&
			!parsedUrl.path.match(/\.mov$/i) &&
			!parsedUrl.path.match(/\.avi$/i) &&
			!parsedUrl.path.match(/\.ico$/i)
			)
	})
	itemcrawler.on("complete",function() {
		logger.info("Search complete, total time="+ (new Date().getTime() - starttime));
		callback();
		deferred.resolve();
		itemcrawler.stop();
	})
	logger.info('Starting crawl for ' + this.name);
	itemcrawler.start();
	return deferred.promise;
};

// var item = new item('New York item', 'nyc','http://www1.nyc.gov');
// item.crawl();



module.exports=Item;