var Deferred = require("promised-io/promise").Deferred;
var winston = require('winston');
var logger = new winston.Logger();
var Crawler = require("simplecrawler");
var unfluff = require('unfluff');
var Elastic = require("../elastic");
var elastic = new Elastic();
logger.add(winston.transports.Console);

var City = function(name, code, url) {
	this.name = name;
	this.code = code;
	this.url = url;
};

var starttime = new Date().getTime();

//TODO: Write integration with db (firebase! Yes!) to get list of city URLs

City.prototype.crawl = function() {
	var deferred = new Deferred();
	var citycrawler = Crawler.crawl(this.url)
	citycrawler.interval = 100;
	citycrawler.maxResourceSize = 1000000;
	citycrawler.scanSubdomains = true;
	citycrawler.on("fetchcomplete", function(queueItem,responseBuffer, response){
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
				body: cleanResponse.body,
				city_code: this.code,
				url: queueItem.url,
				city_name: this.name
			}
			elastic.post('/cities/' + this.code ,JSON.stringify(post_data));
		}
	},
	function(queueItem) {
		logger.error("Error fetching: " + queueItem.url);
	});
	citycrawler.addFetchCondition(function(parsedUrl) {
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
	citycrawler.on("complete",function() {
		logger.info("Search complete, total time="+ (new Date().getTime() - starttime));
		process.exit();
		deferred.resolve();
	})
	citycrawler.start();
	return deferred.promise;
};

var city = new City('New York City', 'nyc','http://www1.nyc.gov');
city.crawl();



module.exports=City;