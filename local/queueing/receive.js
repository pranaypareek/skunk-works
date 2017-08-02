'use strict';

var amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');

const child_process = require('child_process');

let bag = {};

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'hello';

    ch.assertQueue(q, { durable: false });
    console.log('-------------------------------------------');
    console.log('Waiting for messages. To exit press CTRL+C');
    console.log('-------------------------------------------\n');
    ch.consume(q, function(msg) {
      console.log('Runtime received %s', msg.content.toString());
      console.log('\n');
      bag.runtime = msg.content.toString();

      async.series([
        _prepareCMD,
        _spawnChild
      ]);
    }, { noAck: true });
  });
});

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
