'use strict';

const controllers = {
  getTasks: require('../controllers/getTasks.js'),
  createTaskScript: require('../controllers/createTaskScript.js'),
  deleteTask: require('../controllers/deleteTask.js'),
  getTaskInfo: require('../controllers/getTaskInfo.js'),
  runTaskScript: require('../controllers/runTaskScript.js')
};

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
