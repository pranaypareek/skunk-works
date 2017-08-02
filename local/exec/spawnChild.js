'use strict';

const async = require('async');
const fs = require('fs');
const _ = require('underscore');

const child_process = require('child_process');

let bag = {};

if (!_.isEmpty(process.argv[2])) {
  bag.runtime = process.argv[2];
} else {
  console.log('Please provide a runtime argument eg. `node spawnChild.js go`');
  process.exit(0);
}

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
    bag.execFile = '../scripts/hello.js';
  } else if (bag.runtime === 'go') {
    bag.cmd = 'go';
    bag.args.push('run');

    bag.execFile = '../scripts/hello.go';
  } else if (bag.runtime === 'ruby') {
    bag.cmd = 'ruby';
    bag.execFile = '../scripts/hello.rb';
  }

  //the file will always be the last argument in a command
  //eg. (node hello.js) or (go run hello.go) etc
  bag.args.push(bag.execFile);
  return next();
}

//spawn the child process and execute the script
function _spawnChild(next) {
  console.log('Inside ----', _spawnChild.name);

  const result = child_process.spawnSync(bag.cmd, bag.args);
  console.log(result.stdout.toString());
}
