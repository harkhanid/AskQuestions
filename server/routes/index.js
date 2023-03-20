var express = require('express');
const UserRouter = require('./users-route');
const QuestionRouter = require('./question-route');
module.exports = (app)=>{
  app.use('/',UserRouter);
  app.use('/',QuestionRouter);
};