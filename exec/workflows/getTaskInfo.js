'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const file = require('../common/fileUtilities.js');

const amqpUrl = process.env.AMQP_URL;

let store = {};
const dir = process.cwd();

exports.getTaskInfo = function(bag) {
  store = bag;

  async.series([
    _getTaskInfo,
    _publishResult
  ]);
};

function _getTaskInfo(next) {
  console.log('Inside ----', store.action + '|' + _getTaskInfo.name);

  let extension = '';
  extension = file.returnFileExtension(store.query.runtime);

  store.taskFile = store.taskname + extension;

  fs.stat('./scripts/' + store.taskFile, function(err, stats) {
    if (err) return console.log(err);
    store.result = stats;
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
