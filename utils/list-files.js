var fs = require('fs');
var path = require('path');
var rarUtils = require('./rar-utils');

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

function listDir(dirpath, cb) {
  fs.readdir(dirpath, function(err, files) {
    var infos = files.filter(function(filename) { return filename.indexOf('.')!=0; }).map(function(filename) {

      var file = path.resolve(dirpath, filename);
      var stat = fs.statSync(file);

      var info = {
        path: file,
        filename: filename.toString(),
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile()
      };

      return info;
    });

    var waitingForRars = 0;
    infos.filter(function(f) { return f.filename.endsWith('.rar'); }).forEach(function(rar) {
      waitingForRars++;
      rarUtils.rarContent(rar.path, function(content) {
        rar.rarInfo = { file: content };
        --waitingForRars;
        taskComplete();
      });
    });

    var waitingForInfos = 0;
    infos.filter(function(f) { return f.isDirectory; }).forEach(function(dir) {
      var infoPath = path.resolve(dir.path, '.si');
      if (fs.existsSync(infoPath)) {
        waitingForInfos++;
        fs.readFile(infoPath, function(err, data) {
          dir.si = JSON.parse(data);
          waitingForInfos--;
          taskComplete();
        });
      }
    });

    function taskComplete() {
      if (waitingForRars==0 && waitingForInfos==0)
        cb(infos);
    }

    taskComplete();
  });
}

module.exports = listDir;
