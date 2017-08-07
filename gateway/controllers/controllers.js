'use strict';

var amqp = require('amqplib/callback_api');

exports.echoReq = function(req, res) {
  console.log('Received GET:\n', req);
  res.send('OK');
};

exports.publishReq = function(req, res) {
  const reqBody = req.body;
  console.log('Trying to publish:\n', JSON.stringify(reqBody));

  amqp.connect('amqp://172.20.0.1', function(err, conn) {
    console.log(err);
    conn.createChannel(function(err, ch) {
      var q = 'hello';
      var msg = JSON.stringify(reqBody);

      ch.assertQueue(q, {durable: false});
      ch.sendToQueue(q, new Buffer(msg));
      console.log('Published:\n', JSON.stringify(reqBody));
      res.send('OK');
    });
    setTimeout(function() { conn.close(); process.exit(0); res.send('OK');}, 500);
  });
};
