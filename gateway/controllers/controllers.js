'use strict';

exports.echoReq = function(req, res) {
  console.log('Received GET:\n', req);
  res.send('OK');
};

exports.publishReq = function(req, res) {
  const resBody = req.body;
  console.log('Published:\n', resBody);
  res.send('OK');
};
