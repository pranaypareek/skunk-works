'use strict';

const controllers = require('../controllers/controllers.js');

module.exports = function(app) {
  app.route('/tasks')
    .get(controllers.getTasks)
    .post(controllers.createTaskScript);

  app.route('/tasks/:name')
    .delete(controllers.deleteTask);

  app.route('/tasks/:name/info')
    .get(controllers.getTaskInfo);

  app.route('/tasks/:name/run')
    .post(controllers.runTaskScript);
};
