var winston = require('winston');
require('winston-papertrail').Papertrail;
var options={
        host: process.env.PAPERTRAIL_HOST,
        port: process.env.PAPERTRAIL_PORT
    };
var logger = new winston.Logger({
transports: [
    new winston.transports.Papertrail(options)
]
});
module.exports=logger;