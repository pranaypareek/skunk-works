'use strict';

const async = require('async');
const fs = require('fs');
const _ = require('underscore');

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

let bag = {};

async.series([
  _readScriptContent,
  _touchEmptyFile,
  _writeScriptToFile,
  _spawnChild
]);

//TODO: the script will be deliverd in a payload
//For now, emulate the behaviour by reading a script, writing it
//to another file, and executing that file in the spawned process
function _readScriptContent(next) {
  console.log('Inside ----', _readScriptContent.name);

  fs.readFile('hello.js', 'utf8', function(err, contents) {
    if (err) {
      console.log(err);
      return next(err);
    }

    bag.script = contents;
    return next();
  });
}

//creates an empty file to write the received script to
function _touchEmptyFile(next) {
  console.log('Inside ----', _touchEmptyFile.name);
  bag.execFile = 'script.js';

  const cmd = 'touch '.concat(bag.execFile);

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      return next(err);
    }

    console.log('Created empty script file!');
    return next();
  });
}

//writes the received script to a local file to be used for execution
function _writeScriptToFile(next) {
  console.log('Inside ----', _writeScriptToFile.name);

  fs.writeFile(bag.execFile, bag.script, function(err) {
    if (err) {
      console.log(err);
      return next(err);
    }

    console.log('Wrote script to file!');
    return next();
  });
}

//spawn the child process and execute the script
function _spawnChild(next) {
  console.log('Inside ----', _spawnChild.name);

  let args = [];
  args.push(bag.execFile);

  const spawnProcess = spawn('node', args);
  spawnProcess.stdout.setEncoding('utf8');

  bag.res = '';

  //collate data coming from the spawn stream
  spawnProcess.stdout.on('data', function(data) {
    let str = data.toString();
    let lines = str.split(/(\r?\n)/g);
    bag.res += lines.join("");
  });

  //if error, store the error object in the bag variable
  spawnProcess.on('error', function(err) {
    console.log("Error processing the child process:", err);
    bag.error = err;
  });

  spawnProcess.on('close', function(code) {
    if (!_.isEmpty(bag.error)) {
      return next(bag.error);
    } else {
      console.log(bag.res);
      return next();
    }
  });
}
