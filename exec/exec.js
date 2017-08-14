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
  'run': require('./workflows/runTask.js')
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
          /*
          const reqBody = JSON.parse(bag.msg.content.toString());
          bag.runtime = reqBody.runtime;
          bag.script = reqBody.script;
          bag.resQ = reqBody.queue;
          bag.action = reqBody.action;
          bag.taskname = reqBody.taskname;

          if (bag.action === 'list') {
            async.series([
              _listExistingTasks,
              _publishResult
            ]);
          } else if (bag.action === 'delete') {
            async.series([
              _deleteTask,
              _publishResult
            ]);
          } else {
            async.series([
              _writeScriptToFile,
              _prepareCMD,
              _spawnChild,
              _publishResult
            ]);
          }*/
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
  }

  return next();
}

function _listExistingTasks(next) {
  console.log('Inside ----', _listExistingTasks.name);

  const scriptsDir = './scripts/';
  bag.result = {
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
      bag.result.tasks.push(taskObj);
    });
    return next();
  });
}

function _deleteTask(next) {
  console.log('Inside ----', _deleteTask.name);

  let extension = '';

  extension = file.returnFileExtension(bag.runtime);

  let taskFile = bag.taskname + extension;

  fs.unlink('./scripts/' + taskFile, function(err) {
    if (err) {
      bag.result = 'Error deleting task: ' + bag.taskname;
    } else {
      console.log('Successfully deleted: ' + taskFile);
      bag.result = 'Successfully deleted: ' + taskFile;
    }
    return next();
  });
}

function _writeScriptToFile(next) {
  if (bag.action !== 'create') {
    return next();
  }

  console.log('Inside ----', _writeScriptToFile.name);

  let extension = '';

  extension = file.returnFileExtension(bag.runtime);

  bag.taskFile = bag.taskname + extension;

  bag.result = 'Created new script ' + bag.taskFile + ' for task: ' +
    bag.taskname;

  fs.writeFile('./scripts/' + bag.taskFile, bag.script, function(err) {
    if (err) return console.log(err);
    console.log('Written to disk!');
    return next();
  });
}

function _prepareCMD(next) {
  if (bag.action !== 'run') {
    return next();
  }

  console.log('Inside ----', _prepareCMD.name);

  let extension = '';
  bag.cmd = '';
  bag.args = [];

  if (bag.runtime === 'node') {
    bag.cmd = 'node';
  } else if (bag.runtime === 'go') {
    bag.cmd = 'go';
    bag.args.push('run');
  } else if (bag.runtime === 'ruby') {
    bag.cmd = 'ruby';
  }

  extension = file.returnFileExtension(bag.runtime);
  //the file will always be the last argument in a command
  //eg. (node hello.js) or (go run hello.go) etc
  let taskFile = bag.taskname + extension;

  bag.args.push('./scripts/' + taskFile);
  return next();
}

//spawn the child process and execute the script
function _spawnChild(next) {
  if (bag.action !== 'run') {
    return next();
  }

  console.log('Inside ----', _spawnChild.name);

  console.log('\n------------------');
  console.log('Executing:', bag.cmd, bag.args);
  console.log('------------------');

  let startTime = new Date();
  const result = child_process.spawnSync(bag.cmd, bag.args);
  let endTime = new Date();

  bag.result = {};
  bag.result.output = result.stdout.toString();
  bag.result.executionTime = (endTime - startTime) + 'ms';

  console.log(bag.result);

  console.log('------------------');
  console.log('Processed!');
  console.log('------------------\n');

  return next();
}

function _publishResult(next) {
  console.log('Inside ----', _publishResult.name);

  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const resQ = bag.resQ;

      ch.sendToQueue(resQ, new Buffer(JSON.stringify(bag)));
      console.log('Published message to:', bag.resQ);

      return next();
    });
  });
}
