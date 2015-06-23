// set variables for environment
var express = require('express'),
app = express(), 
path = require('path'),
city = require('./models/city.js')

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/nyc', function(req, res) {
  
})

// Set server port
app.listen(4000);
console.log('server is running');