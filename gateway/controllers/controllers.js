'use strict';

const amqp = require('amqplib/callback_api');
const uuidv1 = require('uuid/v1');

exports.echoReq = function(req, res) {
  console.log('Received GET:\n', req);
  res.send('OK');
};

exports.publishReq = function(req, res) {
  const reqBody = req.body;
  console.log('Connecting to queue...\n');

  //add retry logic
  amqp.connect('amqp://172.20.0.1', function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = 'exec';
      const resQ = uuidv1();
      const msg = reqBody;
      msg.queue = resQ;

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
