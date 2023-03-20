const db = require("../models");
const Answers = db.answers;
const Questions = db.questions;
const File = db.files;

exports.save = (ans) =>{
    const newAnswers = new Answers(ans);
    const promise = newAnswers.save();
    console.log("INSIDE SERVICE",promise);
    return promise;
}

exports.find = (question_id,answer_id) =>{
    const promise  = Answers.findAll({
        where:{
            QuestionQuestionID:question_id,
            answer_id:answer_id
        },include:[{model:File,attributes:["file_id","s3_object_name","file_name","created_date"]}]
    });
    return promise
}

exports.remove = (answer_id,question_id) =>{
    const promise = Answers.destroy({where:{
        answer_id:answer_id,
        QuestionQuestionID:question_id
        }
    });
    return promise;
}

exports.update = (question_id, answer_id, body)=>{
    console.log("INSIDE SERVIcE",body);
    const promise  = Answers.update(body,{
        where:{
            QuestionQuestionID:question_id,
            answer_id:answer_id
        }
    });
    return promise;
}