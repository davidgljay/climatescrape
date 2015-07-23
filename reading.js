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
	this.title=title;
	this.body=body;
	this.tags=tags;
	this.url=url;
	this.item_code=item_code;
	this.item_name;
	this.crawled_on=crawled_on;
	this.created_on=created_on;
	this.type=type;
	//Make a unique id from the body fo the page and that page's url. This will be used to detect whether there are duplicate pages.
	this.id = (url + body).replace("\r","").replace("\n","").hashCode();
};

Reading.prototype.exists = function() {
	return elastic.check('/' + self.type + '/' + self.code + '/' + self.id).then(
		function(body) {
			var result = JSON.parse(body);
	        if (result.hits.total>0 && result.hits.hits[0]["_source"].url == self.url) {
	        	//TODO: generate new ID in the event that there's a hash conflict.
	          return true;
	        } else {
	          return false;
	        }
 
		},function(errCode) {
			throw err;
		})
}

Reading.prototype.saveElastic = function() {
	var self = this;
	self.exists().then(function(exists) {
		if (!exists) {
			logger.info("Found new page, saving:" + self.url);
			elastic.post('/' + self.type + '/' + self.code + '/' + self.id , JSON.stringify(self));
		} else {
			logger.info("Page already exists in elastic DB:" + self.url);
		}
	})
};

Reading.prototype.saveSql = function() {
	//TODO: Implement function to save to SQL;
}