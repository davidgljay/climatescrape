/*
Reading model

Passed information by the crawler, saves itself to either an elasticsearch or SQL db.
*/

var winston = require('winston'),
logger = new winston.Logger(),
unfluff = require('unfluff'),
Elastic = require("../db/elastic"),
elastic = new Elastic(),
SQL = require("../db/sql"),
sql = new SQL();
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
	self.id = (url + body).replace("\r","").replace("\n","").hashCode();
};


Reading.prototype.exists = function() {
	var self=this;
	return elastic.check("/" + self.type + '/' + self.item_code + '/' + self.id).then(
		function(body) {
			var result = JSON.parse(body);
	        	//TODO: generate new ID in the event that there's a hash conflict.
	          return result.found;
		},function(err) {
			throw "Exist call returned status " + err;
		})
}

Reading.prototype.saveElastic = function() {
	var self = this;
	self.exists().then(function(exists) {
		if (!exists) {
			logger.info("Saving new page:" + self.url);
			elastic.post('/' + self.type + '/' + self.item_code + '/' + self.id , JSON.stringify(self));
		} else {
			logger.info("Page already exists in elastic DB:" + self.url);
		}
	})
};

Reading.prototype.saveSQL = function() {
	var self=this;
	var query = "INSERT INTO " + process.env.TABLE_NAME + ".READINGS (title, body, tags, url, item_code, item_name, crawled_on, created_on, type, hash) " + 
	"VALUES ('" + self.title + "', '" + self.body + "', '" + self.tags + "', '" + self.url + "', '" + self.item_code + "', '" + self.item_name + "', '" + 
	self.crawled_on + "', '" + self.created_on + "', '" + self.created_on + "', '" + self.type + "', '" + self.hash + "');";
	sql.post(query);
}

module.exports=Reading;