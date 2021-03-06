/*
Reading model

Passed information by the crawler, saves itself to either an elasticsearch or SQL db.
*/

var unfluff = require('unfluff'),
Elastic = require("../db/elastic"),
elastic = new Elastic(),
SQL = require("../db/sql"),
sql = new SQL(),
logger = require('../logger.js');

var Reading = function(title, body,tags,url,site_code,site_name,crawled_on,created_on,type) {
	var self=this;
	self.title=title;
	self.body=body.replace("\n","").replace("\t","");
	self.tags=tags;
	self.url=url;
	self.site_code=site_code;
	self.site_name=site_name;
	self.crawled_on=crawled_on;
	self.created_on=created_on;
	self.type=type;
	//Make a unique id from the body fo the page and that page's url. self will be used to detect whether there are duplicate pages.
	self.id = (url + body).replace("\r","").replace("\n","").replace("\t","").hashCode();

	//Assign a firstDate if one exists.
	var firstDate = self.getFirstDate();
	if (firstDate) {
		self.first_date = firstDate;
	} else {
		self.first_date = '';
	}
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

/* 
* Save to elastic search DB. 
*/
Reading.prototype.saveElastic = function() {
	var self = this;
	elastic.post('/' + self.type + '/' + self.site_code + '/' + self.id + "/_create" , JSON.stringify(self));
};

/* 
* Save to SQL DB. 
*/
Reading.prototype.saveSQL = function() {
	var self=this;
	var query = "INSERT IGNORE INTO " + process.env.SQL_DB + ".READINGS (TITLE, BODY, URL, SITE_CODE, SITE_NAME, CRAWLED_ON, CREATED_ON, FIRST_DATE, TYPE, HASH) " + 
	"VALUES (" + sql.connection.escape(self.title) + ", " + sql.connection.escape(self.body) + "," + sql.connection.escape(self.url) + ", " + sql.connection.escape(self.site_code) + ", " + sql.connection.escape(self.site_name) + ", '" + 
	new Date(self.crawled_on).toMysqlFormat() + "', '" + new Date(self.created_on).toMysqlFormat() + "', '" + (self.first_date ? self.first_date.toMysqlFormat():'') + "', " + sql.connection.escape(self.type) + ", " + sql.connection.escape(self.id) + ");";
	sql.post(query);
}

/*
* Search for dates in body
*/

Reading.prototype.getFirstDate = function() {
	var self = this,
	datestring;
	if (datestring = self.body.match(/[0-31]{1,2}\/[0-9]{1,2}\/[0-9]{4}/)) {
		return new Date(datestring)
	} else if (datestring = self.body.match(/((January)|(February)|(March)|(April)|(May)|(June)|(July)|(August)|(September)|(October)|(November)|(December)) [0-9]{1,2}, [0-9]{4}/i)) {
		return new Date(datestring);
	} else if (datestring= self.body.match(/((Jan)|(Feb)|(Mar)|(Apr)|(May)|(Jun)|(Jul)|(Aug)|(Sep)|(Sept)|(Oct)|(Nov)|(Dec)) [0-9]{1,2}, [0-9]{4}/i)) {
		return new Date(datestring);
	} else {
		return false;
	};
};

/**
 Functions to package dates as SQL;
 **/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};



module.exports=Reading;