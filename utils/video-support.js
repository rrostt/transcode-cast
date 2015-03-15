var ffprobe = require('./ffprobe');

var supportedVideoCodecs = ['h264'];
var supportedAudioCodecs = ['aac'];

function getSupport(input, cb) {
  ffprobe(input, function(result) {
    var audio = "", video = "";
    result.streams.forEach(function(stream) {
      if (stream.codec_type == "audio") {
        audio = stream.codec_name;
      } else if (stream.codec_type == "video") {
        video = stream.codec_name;
      }
    });

    var support = {
      supportsVideo : function() {
        return supportedVideoCodecs.indexOf(video)!==-1;
      },
      supportsAudio : function() {
        return supportedAudioCodecs.indexOf(audio)!==-1;
      }
    };

    cb(support);
  });
}

/*getSupport(process.stdin, function(result) {

  console.log('audio supported: ' + result.supportsAudio());
  console.log('video supported: ' + result.supportsVideo());
});*/

module.exports = getSupport;

