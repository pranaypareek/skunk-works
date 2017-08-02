#!/usr/bin/env node

var amqp = require('../node_modules/amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'hello';
    var msg = process.argv[2];

    ch.assertQueue(q, {durable: false});
    ch.sendToQueue(q, new Buffer(msg));
    console.log('Runtime requested: %s', msg);
  });
  setTimeout(function() { conn.close(); process.exit(0); }, 500);
});
