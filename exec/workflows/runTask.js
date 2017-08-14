'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const child_process = require('child_process');
const file = require('../common/fileUtilities.js');

const amqpUrl = process.env.AMQP_URL;

let store = {};
const dir = process.cwd();

exports.runTask = function(bag) {
  store = bag;

  async.series([
    _prepareCMD,
    _spawnChild,
    _publishResult
  ]);
};

function _prepareCMD(next) {
  console.log('Inside ----', store.action + '|' + _prepareCMD.name);

  let extension = '';
  store.cmd = '';
  store.args = [];

  if (store.runtime === 'node') {
    store.cmd = 'node';
  } else if (store.runtime === 'go') {
    store.cmd = 'go';
    store.args.push('run');
  } else if (store.runtime === 'ruby') {
    store.cmd = 'ruby';
  }

  extension = file.returnFileExtension(store.runtime);
  //the file will always be the last argument in a command
  //eg. (node hello.js) or (go run hello.go) etc
  let taskFile = store.taskname + extension;

  store.args.push('./scripts/' + taskFile);
  return next();
}

//spawn the child process and execute the script
function _spawnChild(next) {
  console.log('Inside ----', store.action + '|' + _spawnChild.name);

  console.log('\n------------------');
  console.log('Executing:', store.cmd, store.args);
  console.log('------------------');

  let startTime = new Date();
  const result = child_process.spawnSync(store.cmd, store.args);
  let endTime = new Date();

  store.result = {};
  store.result.output = result.stdout.toString();
  store.result.executionTime = (endTime - startTime) + 'ms';

  console.log(store.result);

  console.log('------------------');
  console.log('Processed!');
  console.log('------------------\n');

  return next();
}

function _publishResult(next) {
  console.log('Inside ----', store.action + '|' + _publishResult.name);

  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const resQ = store.resQ;

      ch.sendToQueue(resQ, new Buffer(JSON.stringify(store)));
      console.log('Published message to:', store.resQ);

      return next();
    });
  });
}
