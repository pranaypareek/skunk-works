'use strict';

var amqp = require('amqplib/callback_api');

exports.echoReq = function(req, res) {
  console.log('Received GET:\n', req);
  res.send('OK');
};

exports.publishReq = function(req, res) {
  const reqBody = req.body;
  console.log('Published:\n', reqBody);

  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      var q = 'hello';
      var msg = reqBody.runtime;

      ch.assertQueue(q, {durable: false});
      ch.sendToQueue(q, new Buffer(msg));
      //console.log('Runtime requested: %s', msg);
      res.send('OK');
    });
    setTimeout(function() { conn.close(); process.exit(0); res.send('OK');}, 500);
  });
};
