'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const glob = require('glob');
const file = require('../common/fileUtilities.js');

const amqpUrl = process.env.AMQP_URL;

let store = {};

exports.deleteTask = function(bag) {
  store = bag;

  async.series([
    _deleteTask,
    _publishResult
  ]);
};

function _deleteTask(next) {
  console.log('Inside ----', store.action + '|' + _deleteTask.name);

  let taskFileWildCard = './scripts/' + store.taskname + '.*';

  glob(taskFileWildCard, {}, function(err, files) {
    if (err) return console.log(err);

    store.fileName = files[0];

    fs.unlink(store.fileName, function(err) {
      if (err) {
        store.result = 'Error deleting task: ' + store.taskname;
      } else {
        console.log('Successfully deleted: ' + store.taskname);
        store.result = 'Successfully deleted: ' + store.taskname;
      }
      return next();
    });
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
