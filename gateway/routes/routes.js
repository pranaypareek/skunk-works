'use strict';

const controllers = require('../controllers/controllers.js');

module.exports = function(app) {
  app.route('/tasks')
    .get(controllers.echoReq)
    .post(controllers.publishReq);
};
