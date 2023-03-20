const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./server/routes/index');

const db = require('./server/models');
if(process.env.NODE_ENV != 'test'){
    db.sequelize.sync();
}
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

indexRouter(app);
//app.use('/users', usersRouter);

module.exports = app;
