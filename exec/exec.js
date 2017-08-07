'use strict';

var amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');

const child_process = require('child_process');

let bag = {};

amqp.connect('amqp://172.20.0.1', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'hello';

    ch.assertQueue(q, { durable: false });

    console.log('-------------------------------------------');
    console.log('Waiting for messages. To exit press CTRL+C');
    console.log('-------------------------------------------\n');

    ch.consume(q, function(msg) {
      bag.msg = msg;

      async.series([
        _parseJSON,
        _writeScriptToFile,
        _prepareCMD,
        _spawnChild
      ]);
    }, { noAck: true });
  });
});

function _parseJSON(next) {
  console.log('Inside ----', _parseJSON.name);

  const reqBody = JSON.parse(bag.msg.content.toString());

  bag.runtime = reqBody.runtime;
  bag.script = reqBody.script;

  return next();
}

function _writeScriptToFile(next) {
  console.log('Inside ----', _writeScriptToFile.name);

  let execFile = '';

  if (bag.runtime === 'node') {
    execFile = 'scripts/tempScript.js';
  } else if (bag.runtime === 'go') {
    execFile = 'scripts/tempScript.go';
  } else if (bag.runtime === 'ruby') {
    execFile = 'scripts/tempScript.rb';
  }

  bag.execFile = execFile;

  fs.writeFile(bag.execFile, bag.script, function(err) {
    if (err) return console.log(err);
    console.log('Written to disk!');
    return next();
  });
}

function _prepareCMD(next) {
  console.log('Inside ----', _prepareCMD.name);

  bag.cmd = '';
  bag.args = [];

  if (bag.runtime === 'node') {
    bag.cmd = 'node';
  } else if (bag.runtime === 'go') {
    bag.cmd = 'go';
    bag.args.push('run');
  } else if (bag.runtime === 'ruby') {
    bag.cmd = 'ruby';
  }

  //the file will always be the last argument in a command
  //eg. (node hello.js) or (go run hello.go) etc
  bag.args.push(bag.execFile);
  return next();
}

//spawn the child process and execute the script
function _spawnChild(next) {
  console.log('Inside ----', _spawnChild.name);

  console.log('\n------------------');
  console.log('Executing:', bag.cmd, bag.args);
  console.log('------------------');

  const result = child_process.spawnSync(bag.cmd, bag.args);
  console.log(result.stdout.toString());

  console.log('------------------');
  console.log('Processed!');
  console.log('------------------\n');

  return next();
}
