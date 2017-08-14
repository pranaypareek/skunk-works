'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const file = require('../common/fileUtilities.js');

const amqpUrl = process.env.AMQP_URL;

let store = {};
const dir = process.cwd();

exports.deleteTask = function(bag) {
  store = bag;

  async.series([
    _deleteTask,
    _publishResult
  ]);
};

function _deleteTask(next) {
  console.log('Inside ----', store.action + '|' + _deleteTask.name);

  let extension = '';

  extension = file.returnFileExtension(store.runtime);

  let taskFile = store.taskname + extension;

  fs.unlink('./scripts/' + taskFile, function(err) {
    if (err) {
      store.result = 'Error deleting task: ' + store.taskname;
    } else {
      console.log('Successfully deleted: ' + taskFile);
      store.result = 'Successfully deleted: ' + taskFile;
    }
    return next();
  });
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
