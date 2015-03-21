var express = require('express')
var bodyParser = require('body-parser');
var app = express()
var walk = require('walk');
var player = require('chromecast-player')();
var internalIp = require('internal-ip');
var transServer = require('./transcoding-server.js');
var listDir = require('./utils/list-files.js');
var path = require('path');

var streamserver;

var state = {};

var libraryPath = process.argv[2];
var castport = 1235;

app.use(bodyParser.urlencoded({extended: false}));

app.get('/list', function(req, res) {

  var files = [];
  var walker = walk.walk(libraryPath, { followLinks: false});
  walker.on('file', function(root, stat, next) {
    if (stat.name.indexOf('.rar', stat.name.length-4) !== -1)
      files.push( root + "/" + stat.name );
    next();
  });

  walker.on('end', function() {
    res.send( JSON.stringify(files) );
  });
});

app.get('/dir', function(req, res) {
  var requestPath = req.query['path'] || '';
  if (requestPath.indexOf('/')==0) requestPath = requestPath.substring(1);
  listDir(path.resolve(libraryPath, requestPath), function(files) {
    files.forEach(function(file) { file.path = file.path.substring(libraryPath.length); });
    res.send( JSON.stringify(files) );
  });
});

app.use('/index.html', express.static('index.html'));

app.get('/launch', function(req, res) {
  var requestPath = req.param('path');
  if (requestPath.indexOf('/')==0) requestPath = requestPath.substring(1);
  var filePath = path.resolve( libraryPath, requestPath );

  if (streamserver) {
    streamserver.close();
    streamserver = undefined;
  }

  streamserver = transServer.start(filePath, castport);

  player.launch("http://" + internalIp() + ":" + castport + "/video.mp4?path=" + filePath, function(err, p) {
    p.once('playing', function() {
      console.log('now playing');
      res.send('playing');
      state.playing = true;
      state.path = path;
    });
  });
});

app.get('/host', function(req, res) {
  var requestPath = req.param('path');
  if (requestPath.indexOf('/')==0) requestPath = requestPath.substring(1);
  var filePath = path.resolve( libraryPath, requestPath );

  if (streamserver) {
    streamserver.close();
    streamserver = undefined;
  }

  streamserver = transServer.start(filePath, castport);

  res.send('http://' + internalIp() + ':' + castport + "/video.mkv?path=" + filePath);
});

app.get('/state', function(req, res) {
  res.send(JSON.stringify(state));
});

app.get('/pause', function(req, res) {
  player.attach(function(err, p) {
    console.log('pausing');
    p.pause();
    res.send('paused');
  });
});

app.get('/play', function(req, res) {
  player.attach(function(err, p) {
    console.log('playing');
    p.play();
    res.send('playing');
  });
});

var server = app.listen(2000, function() {
  console.log("started");
});
