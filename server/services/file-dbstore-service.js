const db = require("../models");
const File = db.files;
const Questions = db.questions;

exports.save = (ans) =>{
    const newFile = new File(ans);
    const promise = newFile.save();
    return promise;
}

exports.removeQuestionImage = (file_id,question_id) =>{
    const promise = File.destroy({where:{
        file_id:file_id,
        QuestionQuestionID:question_id
        }
    });
    return promise;
}

exports.removeAnswerImage = (file_id,answer_id) =>{
    const promise = File.destroy({where:{
        file_id:file_id,
        AnswerAnswerId:answer_id
        }
    });
    return promise;
}

exports.findbyId = (file_id) =>{
    const promise = File.findOne({where:{
        file_id:file_id,
        },
        attributes:['file_id','s3_object_name','file_name','created_date']
    });
    return promise;
}

exports.findAllQbyId = (qid) =>{
    const promise = File.findAll({where:{
        QuestionQuestionID:qid,
        },
        attributes:['file_id','s3_object_name','file_name','created_date']
    });
    return promise;
}

exports.findAllAbyId = (aid) =>{
    const promise = File.findAll({where:{
        AnswerAnswerId:aid,
        },
        attributes:['file_id','s3_object_name','file_name','created_date']
    });
    return promise;
}