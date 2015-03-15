var getSupport = require('./utils/video-support');

try {
getSupport(process.stdin, function(result) {
  console.log('audio supported: ' + result.supportsAudio());
  console.log('video supported: ' + result.supportsVideo());
});
} catch (e) {}

process.stdout.on('error', function(err) {
  console.log('error!');
});
