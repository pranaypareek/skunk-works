'use strict';

const amqp = require('amqplib/callback_api');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
const _ = require('underscore');

const amqpUrl = process.env.AMQP_URL;

//reads the script folder and parses the tasknames and
//associated runtimes
exports.getTasks = function(req, res) {

  //add retry logic
  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = 'exec';
      const resQ = uuidv1();
      const msg = {};

      msg.queue = resQ;
      msg.action = 'list';

      ch.assertQueue(q, { durable: false });
      ch.assertQueue(resQ, { durable: false });

      ch.sendToQueue(q, new Buffer(JSON.stringify(msg)));
      console.log('Published:\n', JSON.stringify(msg));

      ch.consume(resQ, function(msg) {
        var execResponse = JSON.parse(msg.content.toString());
        console.log('Received msg from exec', execResponse.result);
        var response = {
          'tasks': execResponse.result.tasks
        };

        //TODO: add conn.close() here
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

        //TODO: add conn.close() here
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

        //TODO: add conn.close() here
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

exports.deleteTask = function(req, res) {
  const reqBody = req.body;
  console.log('Publishing request to create task file...\n');

  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = 'exec';
      const resQ = uuidv1();
      const msg = reqBody;

      msg.queue = resQ;
      msg.action = 'delete';
      msg.taskname = req.params.name;

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

        //TODO: add conn.close() here
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

exports.getTaskInfo = function(req, res) {

  //add retry logic
  amqp.connect(amqpUrl, function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = 'exec';
      const resQ = uuidv1();
      const msg = {};

      msg.queue = resQ;
      msg.action = 'info';
      msg.taskname = req.params.name;
      msg.query = req.query;

      ch.assertQueue(q, { durable: false });
      ch.assertQueue(resQ, { durable: false });

      ch.sendToQueue(q, new Buffer(JSON.stringify(msg)));
      console.log('Published:\n', JSON.stringify(msg));

      ch.consume(resQ, function(msg) {
        var execResponse = JSON.parse(msg.content.toString());
        console.log('Received msg from exec', execResponse.result);
        var response = {
          'info': execResponse.result
        };

        //TODO: add conn.close() here
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
