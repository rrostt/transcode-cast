var os = require('os');
var spawn = require('child_process').spawn;

function ffprobe(input, cb) {
  var args = [];
  if (typeof input == "string") {
    args.push('-i', input);
  } else {
    args.push('-i', '-');
  }

  args.push('-of','json','-show_streams');

//  console.log('ffprobe ' + args.join(' '));

  var child = spawn('ffprobe', args);
  var infoString = "";
  child.stdout.on('data', function(data) {
    infoString += data.toString();
  });
  child.stdout.on('end', function() {
    cb(JSON.parse(infoString.trim()));
  });

  child.on('exit', function(code) {
//    console.log('ffprobe exited');
  });

  if (typeof input != "string") {
    input.pipe(child.stdin);

    child.stdin.on('error', function( err ) {
//      console.log('child error');
    });
  }
}

    process.stdout.on('error', function( err ) {
      console.log('pipe error ' + err);
    });

module.exports = ffprobe;
