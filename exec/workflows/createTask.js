'use strict';

const amqp = require('amqplib/callback_api');
const async = require('async');
const fs = require('fs');
const _ = require('underscore');
const child_process = require('child_process');
const file = require('../common/fileUtilities.js');

const glob = require('../node_modules/glob');
const nodeNativePkgs = require('../common/nativePkgs');

const amqpUrl = process.env.AMQP_URL;

let store = {};
const dir = process.cwd();

exports.createTask = function(bag) {
  store = bag;
  console.log('incoming store:', store);

  async.series([
    _writeScriptToFile,
    _writeChainedNexts,
    _parseNPMpackages,
    _runNPMInstall,
    _publishResult
  ]);
};

function _writeScriptToFile(next) {
  console.log('Inside ----', store.action + '|' + _writeScriptToFile.name);

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

function _writeChainedNexts(next) {
  if (!store.chainedNext)
    return next();

  console.log('Inside ----', store.action + '|' + _writeChainedNexts.name);

  fs.writeFile('./scripts/' + store.taskname + '.next', store.chainedNext,
    function(err) {
      if (err) return console.log(err);
      console.log('Next function config written  to disk!');
      return next();
    });
}

function _parseNPMpackages(next) {
  if (store.runtime !== 'node')
    return next();

  console.log('Inside ----', store.action + '|' + _parseNPMpackages.name);

  store.packages = [];

  async.series([
    __parseFilePackages,
    __createJSON,
    __writePackageJSON
  ], function() {
    return next();
  });
}

function _runNPMInstall(next) {
  if (store.runtime !== 'node')
    return next();

  console.log('Inside ----', store.action + '|' + _runNPMInstall.name);

  let cmd = 'npm';
  let args = ['--prefix', './scripts', 'install', './scripts'];
  console.log('running -----', cmd, args);

  let result = child_process.spawnSync(cmd, args);
  console.log('ran cmd -----', result.stdout.toString());

  return next();
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


// Package parsing

function __parseFilePackages(next) {
  console.log('Parsing packages for file:', store.taskFile);
  glob('./scripts/' + store.taskFile, {}, function(er, files) {
    fs.readFile(files[0], 'utf8', function(err, data) {
      if (err) {
        return console.log(err);
      }

      let contentArray = data.split('\n');
      let i = 1;

      contentArray.forEach(l => {
        let indexOfReq = l.indexOf('require');
        if (indexOfReq > -1) {
          store.packages.push(l.slice(indexOfReq + 8, l.length - 2));
        }
        i++;
      });

      return next();
    });
  });
}

function __createJSON(next) {
  let pkgJSON = {};
  pkgJSON.dependencies = {};

  store.packages.forEach(p => {
    p = p.replace(/\'/g, '');

    if (!nodeNativePkgs.nativePkgs.includes(p)) {
      pkgJSON.dependencies[p] = "*";
    }
  });

  store.pkgJSON = pkgJSON;
  return next();
}

function __writePackageJSON(next) {
  fs.writeFile('./scripts/package.json', JSON.stringify(store.pkgJSON), (err) => {
    if (err) throw err;
    console.log('The file has been saved with content:',
      JSON.stringify(store.pkgJSON));
    return next();
  });
}
