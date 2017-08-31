'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const child_process = require('child_process');
const file = require('./common/fileUtilities.js');

const workflows = {
  'list': require('./workflows/listExistingTasks.js'),
  'delete': require('./workflows/deleteTask.js'),
  'create': require('./workflows/createTask.js'),
  'run': require('./workflows/runTask.js'),
  'info': require('./workflows/getTaskInfo.js')
};

const amqpUrl = process.env.AMQP_URL;

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
            _triggerWorkflow
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
  bag.query = reqBody.query;
  bag.chainedNext = reqBody.chainedNext;

  bag.result = {};

  bag = _.omit(bag, 'msg');
  return next();
}

function _triggerWorkflow(next) {
  console.log('Inside ----', _triggerWorkflow.name);

  if (bag.action === 'list') {
    workflows.list.listExistingTasks(bag);
  } else if (bag.action === 'create') {
    workflows.create.createTask(bag);
  } else if (bag.action === 'run') {
    workflows.run.runTask(bag);
  } else if (bag.action === 'delete') {
    workflows.delete.deleteTask(bag);
  } else if (bag.action === 'info') {
    workflows.info.getTaskInfo(bag);
  }

  return next();
}
