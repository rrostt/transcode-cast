var os = require('os');
var spawn = require('child_process').spawn;

function rarContent(path, cb) {
        var child = spawn('unrar', ['lb', path]);
        child.stdout.on('data', function(data) {
                cb(("" + data).trim());
        });
        child.on('exit', function() {
                // done
        });
}

function openRarStream(path, cb) {
  var child = spawn('unrar', ['p','-inul',path], {
                        cwd: os.tmpdir()
  });
                
  child.stdin.on('error', function(err) {
    console.log('unrar error');
  });

  child.stdout.on('error', function() {
    console.log('rar error');
  });

  child.stdout.on('end', function() {
    console.log('rar ended');
  });

  child.on('disconnect', function() {
    console.log('rar disconnect');
  });

  child.on('close', function() {
    console.log('rar closed');
  });

  child.on('exit', function(code) {
    console.log('unrar exited');
  });

  return child.stdout;
}

module.exports = {
  rarContent: rarContent,
  openRarStream: openRarStream
};
