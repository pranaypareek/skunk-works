'use strict';

const amqp = require('amqplib/callback_api');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
const _ = require('underscore');

const amqpUrl = 'amqp://172.20.0.1';

//reads the script folder and parses the tasknames and
//associated runtimes
exports.getTasks = function(req, res) {
  const scriptsDir = '../exec/scripts/';
  let result = {
    tasks: []
  };

  fs.readdir(scriptsDir, function(err, files) {
    _.each(files, function(fileName) {
      let extension = fileName.split('.')[1];
      let runtime = '';

      if (extension === 'js') {
        runtime = 'node';
      } else if (extension === 'go') {
        runtime = 'go';
      } else if (extension === 'rb') {
        runtime = 'ruby';
      }

      let taskObj = {
        taskname: fileName.split('.')[0],
        runtime: runtime
      }
      result.tasks.push(taskObj);
    });

    res.send(result);
  });
};

exports.runTaskScript = function(req, res) {
  const reqBody = req.body;
  console.log('Connecting to queue...\n');

  //add retry logic
  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = 'exec';
      const resQ = uuidv1();
      const msg = reqBody;

      msg.queue = resQ;
      msg.action = 'run';

      ch.assertQueue(q, { durable: false });
      ch.assertQueue(resQ, { durable: false });

      ch.sendToQueue(q, new Buffer(JSON.stringify(msg)));
      console.log('Published:\n', JSON.stringify(reqBody));

      ch.consume(resQ, function(msg) {
        var execResponse = JSON.parse(msg.content.toString());
        console.log('Received msg from exec', execResponse.result);
        var response = {
          'result': execResponse.result
        };
        res.send(response);
      });
    });

    setTimeout(function() {
        conn.close();
        process.exit(0);
        res.send('OK');
      },
      15000);
  });
};

exports.createTaskScript = function(req, res) {
  const reqBody = req.body;
  console.log('Publishing request to create task file...\n');

  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = 'exec';
      const resQ = uuidv1();
      const msg = reqBody;

      msg.queue = resQ;
      msg.action = 'create';

      ch.assertQueue(q, { durable: false });
      ch.assertQueue(resQ, { durable: false });

      ch.sendToQueue(q, new Buffer(JSON.stringify(msg)));
      console.log('Published:\n', JSON.stringify(reqBody));

      ch.consume(resQ, function(msg) {
        var execResponse = JSON.parse(msg.content.toString());
        console.log('Received msg from exec', execResponse.result);
        var response = {
          'result': execResponse.result
        };
        res.send(response);
      });
    });

    setTimeout(function() {
        conn.close();
        process.exit(0);
        res.send('OK');
      },
      15000);
  });
};
