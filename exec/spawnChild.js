'use strict';

const async = require('async');
const fs = require('fs');
const _ = require('underscore');

const spawn = require('child_process').spawn;

let bag = {};
bag.runtime = 'ruby';

async.series([
  _prepareCMD,
  _spawnChild
]);

function _prepareCMD(next) {
  console.log('Inside ----', _prepareCMD.name);

  bag.cmd = '';
  bag.args = [];

  if (bag.runtime === 'node') {
    bag.cmd = 'node';
    bag.execFile = 'hello.js';
  } else if (bag.runtime === 'go') {
    bag.cmd = 'go';
    bag.execFile = 'hello.go';
    bag.args.push('run');
  } else if (bag.runtime === 'ruby') {
    bag.execFile = 'hello.rb';
    bag.cmd = 'ruby';
  }

  bag.args.push(bag.execFile);
  return next();
}

//spawn the child process and execute the script
function _spawnChild(next) {
  console.log('Inside ----', _spawnChild.name);

  const spawnProcess = spawn(bag.cmd, bag.args);
  spawnProcess.stdout.setEncoding('utf8');

  bag.res = '';

  console.log('\n------------------');
  console.log('Executing:', bag.cmd, bag.args);
  console.log('------------------');

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

  //prepare final response when the process exits
  spawnProcess.on('close', function(code) {
    if (!_.isEmpty(bag.error)) {
      return next(bag.error);
    } else {
      console.log('\n------------------');
      console.log('Processed!');
      console.log('------------------');

      console.log(bag.res);
      return next();
    }
  });
}
