const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');

const  port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var routes = require('./routes/routes.js');

routes(app);

app.listen(port);

console.log('Gateway started on port:', port);
