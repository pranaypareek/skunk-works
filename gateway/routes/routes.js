'use strict';

const controllers = require('../controllers/controllers.js');

const ctrl = {
  getTasks: require('../controllers/getTasks.js'),
  createTaskScript: require('../controllers/createTaskScript.js')
}

module.exports = function(app) {
  app.route('/tasks')
    .get(ctrl.getTasks)
    .post(ctrl.createTaskScript);

  app.route('/tasks/:name')
    .delete(controllers.deleteTask);

  app.route('/tasks/:name/info')
    .get(controllers.getTaskInfo);

  app.route('/tasks/:name/run')
    .post(controllers.runTaskScript);
};
