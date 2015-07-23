/*
Reading model

Passed information by the crawler, saves itself to either an elasticsearch or SQL db.
*/

var winston = require('winston');
var logger = new winston.Logger();
var unfluff = require('unfluff');
var Elastic = require("./elastic");
var elastic = new Elastic();
logger.add(winston.transports.Console);

var Reading = function(title, body,tags,url,item_code,item_name,crawled_on,created_on,type) {
	var self=this;
	self.title=title;
	self.body=body;
	self.tags=tags;
	self.url=url;
	self.item_code=item_code;
	self.item_name=item_name;
	self.crawled_on=crawled_on;
	self.created_on=created_on;
	self.type=type;
	//Make a unique id from the body fo the page and that page's url. self will be used to detect whether there are duplicate pages.
	// self.id = (url + body).replace("\r","").replace("\n","").hashCode();
};


Reading.prototype.exists = function() {
	var self=this;
	return elastic.check('/' + self.type + '/' + self.code + '/' + self.id).then(
		function(body) {
			var result = JSON.parse(body);
	        if (result.hits.total>0 && result.hits.hits[0]["_source"].url == self.url) {
	        	//TODO: generate new ID in the event that there's a hash conflict.
	          return true;
	        } else {
	          return false;
	        }
 
		},function(err) {
			throw err;
		})
}

Reading.prototype.saveElastic = function() {
	var self = this;
	self.exists().then(function(exists) {
		if (!exists) {
			logger.info("Found new page, saving:" + self.url);
			logger.info(JSON.stringify(self))
			elastic.post('/' + self.type + '/' + self.code + '/' + self.id , JSON.stringify(self));
		} else {
			logger.info("Page already exists in elastic DB:" + self.url);
		}
	})
};

Reading.prototype.saveSql = function() {
	var self=this;
	var query = "INSERT INTO " + process.env.TABLE_NAME + ".READINGS (title, body, tags, url, item_code, item_name, crawled_on, created_on, type) " + 
	"VALUES ('" + self.title + "', '" + self.body + "', '" + self.tags + "', '" + self.url + "', '" + self.item_code + "', '" + self.item_name + "', '" + 
	self.crawled_on + "', '" + self.created_on + "', '" + self.created_on + "', '" + self.type + "');";
	console.log("Query: " + query);
	//SQL.post(query);u

	//TODO: Implement function to save to SQL;
}

module.exports=Reading;