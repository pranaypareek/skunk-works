'use strict';

const fs = require('fs');
const glob = require('../node_modules/glob');
const async = require('../node_modules/async');
const nodeNativePkgs = require('./nativePkgs');
const child_process = require('child_process');

let store = {};

exports.parsePackages = function(filename) {
  store.filename = filename;
  store.packages = [];

  //let result = child_process.spawnSync('ls', ['-la']);
  //console.log(result.stdout.toString());

  async.series([
    _parseFilePackages,
    _createJSON,
    _writePackageJSON
  ]);
};

function _parseFilePackages(next) {
  console.log('Parsing packages for file:', store.filename);
  glob('./scripts/' + store.filename, {}, function(er, files) {
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

function _createJSON(next) {
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

function _writePackageJSON(next) {
  fs.writeFile('./scripts/package.json', JSON.stringify(store.pkgJSON), (err) => {
    if (err) throw err;
    console.log('The file has been saved with content:',
      JSON.stringify(store.pkgJSON));
  });
}
