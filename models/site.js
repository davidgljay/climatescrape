var winston = require('winston'),
unfluff = require('unfluff'),
Elastic = require("../db/elastic"),
Reading = require("./reading");

var logger = new winston.Logger(),
elastic = new Elastic();
logger.add(winston.transports.Console);

var Site = function(name, url,type) {
	this.name = name;
	this.type = type;
	if (url.substring(0,6)=="http://") {
		this.url = url;
	} else {
		this.url = "http://" + url; 
	}
	//Extracing site code form url. In principal this could create conflicts, but I think I'm ok.
	this.code = url.split('.').reverse()[1];
};

var starttime = new Date().getTime();

Site.prototype.crawl = function(callback) {
	var self=this;
	var Crawler = require("simplecrawler");
	var crawlerProcess = new Crawler.crawl(self.url);
	crawlerProcess.setMaxListeners(45);
	crawlerProcess.interval = 500;
	crawlerProcess.maxResourceSize = 1000000;
	crawlerProcess.scanSubdomains = true;
	crawlerProcess.on("fetchcomplete", function(queueItem,responseBuffer, response){
		if (queueItem.stateData.contentType && queueItem.stateData.contentType.substring(0,9)=="text/html") {
			var cleanResponse = unfluff(responseBuffer.toString('utf-8'),'en');
			var reading = new Reading(cleanResponse.title, cleanResponse.text.replace("\n"," ").replace("\t","").replace("\r",""), 
				cleanResponse.tags, queueItem.url, self.code, self.name, Date.now(), Date.now(), self.type);
			reading.saveElastic();
			reading.saveSQL();
			logger.info('Finished saving ' + queueItem.url);
		}
	},
	function(queueItem) {
		logger.error("Error fetching: " + queueItem.url);
	});
	crawlerProcess.addFetchCondition(function(parsedUrl) {
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
	crawlerProcess.on("complete",function() {
		logger.info("Search complete, total time="+ (new Date().getTime() - starttime));
		callback();
	})
	logger.info('Starting crawl for ' + self.name + " " + self.url);
	crawlerProcess.start();
};

module.exports=Site;