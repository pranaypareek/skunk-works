'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const file = require('../common/fileUtilities.js');

const amqpUrl = 'amqp://localhost';

let store = {};

exports.listExistingTasks = function(bag) {
  store = bag;

  async.series([
    _listExistingTasks,
    _publishResult
  ]);
};

function _listExistingTasks (next) {
  console.log('Inside ----', _listExistingTasks.name);

  const scriptsDir = './scripts/';
  store.result = {
    tasks: []
  };

  fs.readdir(scriptsDir, function(err, files) {
    _.each(files, function(fileName) {
      let extension = fileName.split('.')[1];
      let runtime = '';

      runtime = file.returnFileRuntime(extension);

      let taskObj = {
        taskname: fileName.split('.')[0],
        runtime: runtime
      };
      store.result.tasks.push(taskObj);
    });
    return next();
  });
}

function _publishResult(next) {
  console.log('Inside ----', _publishResult.name);

  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const resQ = store.resQ;

      ch.sendToQueue(resQ, new Buffer(JSON.stringify(store)));
      console.log('Published message to:', store.resQ);

      return next();
    });
  });
}
