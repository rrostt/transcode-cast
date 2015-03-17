var Transcoder = require('stream-transcoder');
var http = require('http');
var rar = require('./utils/rar-utils.js');
var internalIp = require('internal-ip');
var stream = require('stream');
var DelayedStream = require('delayed-stream');
var fs = require('fs');
var videoSupport = require('./utils/video-support');

function startTranscodingServer(path, port) {

  return http.createServer(function(req, res) {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*'
    });

    console.log('http request');

    // get rarStream, analyse with ffprobe
    // get rarStream again, set ffmpeg flags based on analysis from ffprobe

    function openVideoStream() {
      if (path.substring(path.length-4)=='.rar') {
        return rar.openRarStream(path);
      } else {
        return fs.createReadStream(path);
      }
    }

    videoSupport( openVideoStream(), function(support) {
      console.log('got support ' + JSON.stringify(support) );

      var videoStream = openVideoStream();
      var trans = new Transcoder( videoStream )
  	  .custom('strict', 'experimental')
          .format('matroska')
//          .custom('ss', '00:20:00')
          .on('finish', function() {
            console.log('finished transcoding');
          })
          .on('error', function(err) {
            console.log('transcoding error: %o', err);
          })
          .on('progress', function(progress) {
            console.log('Progress: ' + progress.progress);
          });

      if (support.supportsAudio()) {
        trans.audioCodec('copy');
      } else {
        trans.audioCodec('aac')
          .custom('ac', '2');
      }

      if (support.supportsVideo()) {
        trans.videoCodec('copy');
      } else {
        trans.videoCodec('libx264')
          .custom('movflags', 'frag_keyframe');
      }

      var args = trans._compileArguments();
      args = [ '-i', '-' ].concat(args);
      args.push('pipe:1');
      console.log('spawning ffmpeg ', args.join(' '));

      var transStream = trans.stream();
      transStream.pipe(res);

      videoStream.on('end', function() { console.log('video stream ended'); });

      req.on('close', stopStream);
      req.on('end', stopStream);

      function stopStream() {
        transStream.destroy();
      }
    });

  }).listen(port);
}

module.exports = {
  start : startTranscodingServer
};
