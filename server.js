var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  redisClient = require('redis').createClient({host : 'localhost', port : 6379});

redisClient.on('ready',function() {
    console.log("Redis is ready");
});
redisClient.on('error',function() {
    console.log("Error in Redis");
});

// API supports ContentType application/json & application/x-www-form-urlencoded Headers
app.use(express.json());
app.use(express.urlencoded());

// Grab API routes and controllers
var routes = require('./api/routes/anagramRoutes');
routes(app);

// Start server on localhost:3000
app.listen(port);

console.log('Anagram Api Started: ' + port);