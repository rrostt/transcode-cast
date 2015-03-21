var player = require('chromecast-player')();
var transServer = require('./transcoding-server.js');
var internalIp = require('internal-ip');

var port = 1234;

transServer.start(process.argv[2], port);

/*player.launch("http://" + internalIp() + ":" + port + "/video.mp4", function(err, p) {
	p.once('playing', function() {
		console.log('now playing');
	});
});*/

console.log('listening on port ' + port);
