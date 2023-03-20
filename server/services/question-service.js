const db = require("../models");
const { Sequelize, category } = require('../models');
const e = require('express');
const answer = require("../models/answers");
const Users = db.users;
const Questions = db.questions;
const Op = db.Sequelize.Op;
const Category = db.category;
const QuestionCategory = db.QuestionCategory;
const Answer = db.answers;
const File = db.files;

exports.save = (question) =>{
    const newQuestion = new Questions(question,{include:"Categories"});
    const promise = newQuestion.save();
    return promise;
}

exports.list = (question_id) =>{
    const promise = Questions.findAll({
        include:[{
            model:Category,
            attributes: ['id','category'],
            through:{
                attributes:[]
            }
        },{model:Answer, include:[{model:File,attributes:["file_id","s3_object_name","file_name","created_date"]}]},{model:File,attributes:["file_id","s3_object_name","file_name","created_date"]}]
    });
    return promise;
}

exports.findbyid = (question_id) =>{
    const promise = Questions.findOne({
        where:{ question_id : question_id },
        include:[{
            model:Category,
            attributes: ['id','category'],
            through:{
                attributes:[]
            }
        },{model:Answer, include:[{model:File,attributes:["file_id","s3_object_name","file_name","created_date"]}]},{model:File,attributes:["file_id","s3_object_name","file_name","created_date"]}]
    });
    return promise;
}

exports.remove = (question_id) =>{
    const promise = Questions.destroy({where:{
        question_id:question_id}
    });
    return promise;
}

exports.findAllCatag = (id) =>{
    const promise = Questions.findAll({
        where:{question_id:id},
        include:Category
    });
    return promise;
};

exports.updateQuestion =(id, ques) => { 
    const promise = Questions.update(ques,{
        where:{
            question_id:id
        }
    })
};