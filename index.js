// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashbord = require('parse-dashboard');
var path = require('path');
var publicIP = require("public-ip");

//get machine's public ip address
publicIP.v4().then(ip => {
  var options = {
    allowInsecureHTTP: true
  }

  var dashboard = new ParseDashbord({
    "apps": [{
      "serverURL": "http://" + ip + ":1337/parse",
      "appId": "talhuntAppId",
      "masterKey": "ioVfggXfTl9NGww0Cc55",
      "appName": "Talhunt"
    }],
    "users": [{
      "user": "Manju",
      "pass": "$2b$10$l6FmblFmehnG3RWgaraX5./H9ePUAiJHOkTfIHJ86fW28W06izxMC"
    }],
    "useEncryptedPasswords": true
  }, options)

  var api = new ParseServer({
    //basic config
    databaseURI: 'mongodb://localhost:27017/dev',
    cloud: __dirname + '/cloud/main.js',
    appId: 'talhuntAppId',
    masterKey: 'ioVfggXfTl9NGww0Cc55',
    restAPIKey: "twfjvixPrIc5yQeu06AATbAVjAtdzNon",
    serverURL: "http://" + ip + ":1337/parse", // Don't forget to change to https

    //extra config
    allowClientClassCreation: false,
    enableAnonymousUsers: false,
    liveQuery: {
      classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    }
  });

  var app = express();

  // Serve static assets from the /public folder
  app.use('/public', express.static(path.join(__dirname, '/public')));

  // Serve the Parse API on the /parse URL prefix
  app.use('/parse', api);
  app.use('/dashboard', dashboard);

  // Parse Server plays nicely with the rest of your web routes
  app.get('/', function (req, res) {
    res.status(200).send('Oh Hi There :)');
  });

  // There will be a test page available on the /test path of your server url
  // Remove this before launching your app
  app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/test.html'));
  });

  var port = 1337;
  var httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });

  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
})