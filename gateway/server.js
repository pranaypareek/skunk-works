const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const  port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/routes.js');

routes(app);

app.listen(port);

console.log('Gateway started on port:', port);
