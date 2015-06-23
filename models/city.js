var Deferred = require("promised-io/promise").Deferred;
var winston = require('winston');
var logger = new winston.Logger();
var Crawler = require("simplecrawler");
logger.add(winston.transports.Console);

var City = function() {

};

var starttime = new Date().getTime();

//TODO: Write integration with db (firebase! Yes!) to get list of city URLs

City.prototype.crawl = function(url) {
	var citycrawler = Crawler.crawl(url)
	citycrawler.interval = 100;
	citycrawler.maxResourceSize = 1000000;
	citycrawler.scanSubdomains = true;
	citycrawler.on("fetchcomplete", function(queueItem){
 	   // logger.info("Completed fetching resource:" + queueItem.url);
	},
	function(queueItem) {
		logger.error("Error fetching: " + queueItem.url);
	});
	citycrawler.on("fetchheaders", function(queueItem,response) {
		// logger.info(response.headers["content-type"]);
	})
	// citycrawler.addFetchCondition(function(parsedUrl) {
	// 	logger.info(parsedUrl.path + " " + parsedUrl.path.match(/nyc\.gov/i))
	// 	return parsedUrl.path.match(/nyc\.gov/i)
	// })
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
	})
	citycrawler.start();
};

var city = new City();
city.crawl("http://www1.nyc.gov");


module.exports=City;