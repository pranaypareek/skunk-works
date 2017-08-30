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
const util = require('util');

let store = {};

exports.runTask = function(bag) {
  store = bag;

  async.series([
    _prepareCMD,
    _parseNPMpackages,
    _runNPMInstall,
    _spawnChild,
    _publishResult
  ]);
};

function _prepareCMD(next) {
  console.log('Inside ----', store.action + '|' + _prepareCMD.name);

  let extension = '';
  store.cmd = '';
  store.args = [];

  if (store.runtime === 'node') {
    store.cmd = 'node';
  } else if (store.runtime === 'go') {
    store.cmd = 'go';
    store.args.push('run');
  } else if (store.runtime === 'ruby') {
    store.cmd = 'ruby';
  }

  extension = file.returnFileExtension(store.runtime);
  //the file will always be the last argument in a command
  //eg. (node hello.js) or (go run hello.go) etc
  store.taskFile = store.taskname + extension;

  if (store.runtime === 'go') {
    store.args.push('./scripts/' + store.taskname);
  } else {
    store.args.push('./scripts/' + store.taskFile);
  }

  return next();
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

//spawn the child process and execute the script
function _spawnChild(next) {
  console.log('Inside ----', store.action + '|' + _spawnChild.name);

  console.log('\n------------------');
  console.log('Executing:', store.cmd, store.args);
  console.log('------------------');

  let startTime = new Date();
  const result = child_process.spawnSync(store.cmd, store.args);
  let endTime = new Date();

  store.result = {};
  store.result.output = result.stdout.toString();
  store.result.executionTime = (endTime - startTime) + 'ms';

  console.log(store.result);

  console.log('------------------');
  console.log('Processed!');
  console.log('------------------\n');

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
