'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const file = require('../common/fileUtilities.js');

const amqpUrl = process.env.AMQP_URL;

let store = {};
const dir = process.cwd();

exports.createTask = function(bag) {
  store = bag;

  async.series([
    _writeScriptToFile,
    _publishResult
  ]);
};

function _writeScriptToFile(next) {
  console.log('Inside ----', _writeScriptToFile.name);

  let extension = '';

  extension = file.returnFileExtension(store.runtime);

  store.taskFile = store.taskname + extension;

  store.result = 'Created new script ' + store.taskFile + ' for task: ' +
    store.taskname;

  fs.writeFile('./scripts/' + store.taskFile, store.script, function(err) {
    if (err) return console.log(err);
    console.log('Written to disk!');
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
