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
sql = new SQL(),
esacpe = sql.connection.esacpe;
logger.add(winston.transports.Console);

var Reading = function(title, body,tags,url,site_code,site_name,crawled_on,created_on,type) {
	var self=this;
	self.title=title;
	self.body=body;
	self.tags=tags;
	self.url=url;
	self.site_code=site_code;
	self.site_name=site_name;
	self.crawled_on=crawled_on;
	self.created_on=created_on;
	self.type=type;
	//Make a unique id from the body fo the page and that page's url. self will be used to detect whether there are duplicate pages.
	self.id = (url + body).replace("\r","").replace("\n","").hashCode();
};


Reading.prototype.exists = function() {
	var self=this;
	return elastic.check("/" + self.type + '/' + self.site_code + '/' + self.id).then(
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
			elastic.post('/' + self.type + '/' + self.site_code + '/' + self.id , JSON.stringify(self));
		} else {
			logger.info("Page already exists in elastic DB:" + self.url);
		}
	})
};

Reading.prototype.saveSQL = function() {
	var self=this;
	var query = "INSERT INTO " + process.env.TABLE_NAME + ".READINGS (title, body, tags, url, site_code, site_name, crawled_on, created_on, type, hash) " + 
	"VALUES ('" + escape(self.title) + "', '" + escape(self.body) + "', '" + escape(self.tags) + "', '" + escape(self.url) + "', '" + escape(self.site_code) + "', '" + escape(self.site_name) + "', '" + 
	escape(self.crawled_on) + "', '" + escape(self.created_on) + "', '" + escape(self.created_on) + "', '" + escape(self.type) + "', '" + escape(self.hash) + "');";
	sql.post(query);
}

module.exports=Reading;