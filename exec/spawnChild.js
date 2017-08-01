var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var bag = {};

async.series([
  _readScriptContent,
  _touchEmptyFile,
  _writeScriptToFile,
  _spawnChild
]);

function _readScriptContent(next) {
  console.log('Inside ----', _readScriptContent.name);

  fs.readFile('hello.js', 'utf8', function(err, contents) {
    if (err) {
      console.log(err);
      return (next(err));
    }

    bag.script = contents;
    return next();
  });
}

function _touchEmptyFile(next) {
  console.log('Inside ----', _touchEmptyFile.name);

  exec('touch script.js', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return (next(err));
    }

    console.log('Created empty script file!');
    return next();
  });
}

function _writeScriptToFile(next) {
  console.log('Inside ----', _writeScriptToFile.name);
  bag.args = [];

  fs.writeFile('script.js', bag.script, function(err) {
    if (err) {
      console.log(err);
      return (next(err));
    }

    bag.args.push('script.js');
    console.log('Wrote script to file!');
    return next();
  });
}

function _spawnChild(next) {
  console.log('Inside ----', _spawnChild.name);

  var spawnProcess = spawn('node', bag.args);
  spawnProcess.stdout.setEncoding('utf8');

  bag.res = '';

  spawnProcess.stdout.on('data', function(data) {
    var str = data.toString()
    var lines = str.split(/(\r?\n)/g);
    bag.res += lines.join("");
  });

  spawnProcess.on('close', function(code) {
    console.log(bag.res);
  });

  return next();
}
