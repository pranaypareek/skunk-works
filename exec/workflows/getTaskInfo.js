'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const file = require('../common/fileUtilities.js');
const glob = require('glob');

const amqpUrl = process.env.AMQP_URL;

let store = {};
const dir = process.cwd();

exports.getTaskInfo = function(bag) {
  store = bag;

  async.series([
    _getTaskInfo,
    _readFileContent,
    _publishResult
  ]);
};

function _getTaskInfo(next) {
  console.log('Inside ----', store.action + '|' + _getTaskInfo.name);

  let taskFileWildCard = './scripts/' + store.taskname + '.*';

  glob(taskFileWildCard, {}, function(err, files) {
    if (err) return console.log(err);

    store.fileName = files[0];
    fs.stat(store.fileName, function(err, stats) {
      if (err) return console.log(err);
      store.result = stats;
      store.result.taskname = store.taskname;
      store.result.runtime =
        file.returnFileRuntime(store.fileName.split('.')[2]);
      return next();
    });
  });
}

function _readFileContent(next) {
  fs.readFile(store.fileName, 'utf8', function(err, data) {
    if (err) return console.log(err);
    store.result.script = data;
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
