'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const child_process = require('child_process');

const amqpUrl = 'amqp://172.20.0.1';

let bag = {};

async.retry({ times: 32, interval: 500 }, function(next) {
    console.log('Retrying...');
    amqp.connect(amqpUrl, function(err, conn) {
      if (err) {
        next(err);
      } else {
        next(null, conn);
      }
    });
  },
  function(err, conn) {
    if (err) {
      console.log('Could not connect to RabbitMQ!');
    } else {
      console.log('Connection successful!');
      conn.createChannel(function(err, ch) {
        var q = 'exec';

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
            _spawnChild,
            _publishResult
          ]);
        }, { noAck: true });
      });
    }
  });

function _parseJSON(next) {
  console.log('Inside ----', _parseJSON.name);

  const reqBody = JSON.parse(bag.msg.content.toString());

  bag.runtime = reqBody.runtime;
  bag.script = reqBody.script;
  bag.resQ = reqBody.queue;
  bag.action = reqBody.action;
  bag.taskname = reqBody.taskname;

  return next();
}

function _writeScriptToFile(next) {
  if (bag.action !== 'create') {
    return next();
  }

  console.log('Inside ----', _writeScriptToFile.name);

  let extension = '';

  if (bag.runtime === 'node') {
    extension = '.js';
  } else if (bag.runtime === 'go') {
    extension = '.go';
  } else if (bag.runtime === 'ruby') {
    extension = '.rb';
  }

  bag.taskFile = bag.taskname + extension;

  bag.result = 'Created new script ' + bag.taskFile + ' for task: ' +
    bag.taskname;

  fs.writeFile('./scripts/' + bag.taskFile, bag.script, function(err) {
    if (err) return console.log(err);
    console.log('Written to disk!');
    return next();
  });
}

function _prepareCMD(next) {
  if (bag.action !== 'run') {
    return next();
  }

  console.log('Inside ----', _prepareCMD.name);

  let extension = '';
  bag.cmd = '';
  bag.args = [];

  if (bag.runtime === 'node') {
    bag.cmd = 'node';
    extension = '.js';
  } else if (bag.runtime === 'go') {
    bag.cmd = 'go';
    bag.args.push('run');
    extension = '.go';
  } else if (bag.runtime === 'ruby') {
    bag.cmd = 'ruby';
    extension = '.rb';
  }

  //the file will always be the last argument in a command
  //eg. (node hello.js) or (go run hello.go) etc
  let taskFile = bag.taskname + extension;

  bag.args.push('./scripts/'+taskFile);
  return next();
}

//spawn the child process and execute the script
function _spawnChild(next) {
  if (bag.action !== 'run') {
    return next();
  }

  console.log('Inside ----', _spawnChild.name);

  console.log('\n------------------');
  console.log('Executing:', bag.cmd, bag.args);
  console.log('------------------');

  console.time('exec');
  const result = child_process.spawnSync(bag.cmd, bag.args);
  console.timeEnd('exec');

  bag.result = result.stdout.toString();

  console.log(bag.result);

  console.log('------------------');
  console.log('Processed!');
  console.log('------------------\n');

  return next();
}

function _publishResult(next) {
  console.log('Inside ----', _publishResult.name);

  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const resQ = bag.resQ;

      ch.sendToQueue(resQ, new Buffer(JSON.stringify(bag)));
      console.log('Published message to:', bag.resQ);

      return next();
    });
  });
}
