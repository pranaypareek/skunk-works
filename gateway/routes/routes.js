'use strict';

const controllers = require('../controllers/controllers.js');

module.exports = function(app) {
  app.route('/tasks')
    .get(controllers.getTasks)
    .post(controllers.createTaskScript);

  app.route('/tasks/run')
    .post(controllers.runTaskScript);

  app.route('/tasks/:name')
    .delete(controllers.deleteTask);
};
