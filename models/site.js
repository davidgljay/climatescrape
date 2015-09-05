var unfluff = require('unfluff'),
Elastic = require("../db/elastic"),
Reading = require("./reading"),
Crawler = require("simplecrawler"),
logger = require('../logger.js');


var elastic = new Elastic();

var Site = function(name, url,type, blacklist) {
	this.name = name;
	this.type = type;
	this.blacklist = blacklist;
	if (url.substring(0,6)=="http://") {
		this.url = url;
	} else {
		this.url = "http://" + url; 
	}
	//Extracing site code form url. In principal this could create conflicts, but I think I'm ok.
	this.code = url.split('.').reverse()[1];
};

var starttime = new Date().getTime();
var counter =0;

Site.prototype.crawl = function(callback) {
	var self=this;
	var crawlerProcess = new Crawler.crawl(self.url);
	crawlerProcess.setMaxListeners(45);
	crawlerProcess.interv
	crawlerProcess.maxResourceSize = 1000000;
	crawlerProcess.scanSubdomains = true;
	crawlerProcess.on("fetchcomplete", function(queueItem,responseBuffer, response){
		if (queueItem.stateData.contentType && queueItem.stateData.contentType.substring(0,9)=="text/html") {
			var cleanResponse = unfluff(responseBuffer.toString('utf-8'),'en');
			var reading = new Reading(cleanResponse.title, cleanResponse.text.replace("\n"," ").replace("\t","").replace("\r",""), 
				cleanResponse.tags, queueItem.url, self.code, self.name, Date.now(), Date.now(), self.type);
			reading.saveElastic();
			reading.saveSQL();
			counter++;
			if (counter==100) {
				logger.info("Saving site :" + queueItem.url);
				counter=0;
			}
		}
	},
	function(queueItem) {
		logger.error("Error fetching: " + queueItem.url);
	});
	crawlerProcess.addFetchCondition(function(parsedUrl) {
		return self.checkUrl(parsedUrl);
	})
	crawlerProcess.on("complete",function() {
		logger.info("Search complete, total time="+ (new Date().getTime() - starttime));
		crawlerProcess.removeAllListeners();
		callback();
	})
	logger.info('Starting crawl for ' + self.name + " " + self.url);
	crawlerProcess.start();
};

Site.prototype.checkUrl = function(parsedUrl) {
	var self=this;
	for (var i = self.blacklist.length - 1; i >= 0; i--) {
		if (parsedUrl.path.indexOf(self.blacklist[i].url) > -1) {
			return false;
		}
	};
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
};

module.exports=Site;