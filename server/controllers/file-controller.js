const request = require('express');
const response = require('express');
const bcrypt = require('bcrypt');

const questionService = require('../services/question-service');
const answerService = require('../services/answer-service');
const Validation = require('../services/validation-service');

const uploadService = require('../services/file-upload-service');

const singleUpload = uploadService.upload.single('billAttachment');
const fileService = require('../services/file-dbstore-service');
const file = require('../models/file');
const question = require('../models/question');
const answer = require('../models/answers');
const { answers } = require('../models');

const logger = require('../config/logger').logger;
const sdc = require('../config/statsd').sdc;

exports.postQuestionImage = async(request, response) =>{
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        sdc.timing("webapp.api.UploadImageQuestion.apiTime",date1);
        logger.error("PostQuestionImage : ",e.message);
        response.status(400).send();
    }
    if(!auth.status){
        sdc.timing("webapp.api.UploadImageQuestion.apiTime",date1);
        logger.error("PostQuestionImage : Unauthenticated User tried to post image")
        response.status(401).send();
    }else{
        const quesObj = await questionService.findbyid(request.params.id);
        if(quesObj == null){
            logger.error("PostQuestionImage : No file is passed");
            sdc.timing("webapp.api.UploadImageQuestion.apiTime",date1);
            response.status(400).send();
        }else if(quesObj.user_id != auth.id ){
            logger.error("PostQuestionImage : Unauthenticated User tried to post image")
            sdc.timing("webapp.api.UploadImageQuestion.apiTime",date1);
            response.status(401).send();
        }else if(request.body.created_timestamp || request.body.updated_timestamp 
            || request.body.question_id){
            sdc.timing("webapp.api.UploadImageQuestion.apiTime",date1);
            response.status(400).send();
        }else{ 
            const questionId= request.params.id;
            let date2 = new Date();
            singleUpload(request,response,async(res)=>{  
                sdc.timing("webapp.api.UploadImageQuestion.imageTime",date2);
                if(request.file == undefined){
                    sdc.timing("webapp.api.UploadImageQuestion.apiTime",date1);
                    logger.error("PostQuestionImage : Image was not uploaded to s3")
                    response.status(400).send();
                }else{
                    let date3 = new Date();
                    const resp = await fileService.save({
                        file_name:request.file.originalname,
                        s3_object_name:request.file.key,
                        file_size:request.file.size,
                        file_storage_class:request.file.storageClass,
                        QuestionQuestionId:questionId
                    });
                    const fres= await fileService.findbyId(resp.file_id);
                    sdc.timing("webapp.api.UploadImageQuestion.apiTime",date3);
                    sdc.timing("webapp.api.UploadImageQuestion.apiTime",date1);
                    logger.info('questionImage : File is uploaded');
                    response.status(200).send(fres);
                }
            });
        }
    }   
};

exports.postAnswerImage = async(request, response)=>{
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        logger.error("PostAnswerImage : ",e.message);
        sdc.timing("webapp.api.UploadImageAnswer.apiTime",date1);
        response.status(400).send();
    }
    if(!auth.status){
        sdc.timing("webapp.api.UploadImageAnswer.apiTime",date1);
        logger.warn("PostAnswerImage : Invalid User ID or Password");
        response.status(401).send();
    }else{
        question_id = request.params.qid;
        answer_id = request.params.id;
        console.log("------------",answer_id);
        const quesObj = await answerService.find(question_id, answer_id);
        if(quesObj.length ==0){
            sdc.timing("webapp.api.UploadImageAnswer.apiTime",date1);
            response.status(400).send();
        }else if(quesObj[0].user_id != auth.id ){
            sdc.timing("webapp.api.UploadImageAnswer.apiTime",date1);
            logger.warn("PostAnswerImage : Unauthenticated User");
            response.status(401).send();
        }else if(request.body.created_timestamp || request.body.updated_timestamp 
            || request.body.answer_id ){
            sdc.timing("webapp.api.UploadImageAnswer.apiTime",date1);
            response.status(400).send();
        }else{
            const questionId= request.params.qid;
            let date2 = new Date();
            singleUpload(request,response,async(res)=>{  
                //response.status(200).send(res);
                sdc.timing("webapp.api.UploadImageAnswer.fileTime",date1);
                if(request.file == undefined){

                logger.error("PostAnswerImage : Image Upload failed");
                    sdc.timing("webapp.api.UploadImageAnswer.apiTime",date1);
                    response.status(400).send();
                }else{
                    console.log("FILE:::::::::::::::::",request.file);
                    let date3 = new Date();
                    const resp = await fileService.save({
                        file_name:request.file.originalname,
                        s3_object_name:request.file.key,
                        file_size:request.file.size,
                        file_storage_class:request.file.storageClass,
                        AnswerAnswerId:answer_id
                    });
                    const fres= await fileService.findbyId(resp.file_id);
                    sdc.timing("webapp.api.UploadImageQuestion.dbTime",date3);
                    sdc.timing("webapp.api.UploadImageAnswer.apiTime",date1);
                    logger.info('answerImage : File is uploaded');
                    response.status(200).send(fres);
                }
            });
        }
    }
};

exports.deleteQuestionImage = async(request, response)=>{
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        sdc.timing("webapp.api.deleteImageQuestion.apiTime",date1);
        logger.error("PostAnswerImage : "+e.message);
        response.status(400).send();
    }
    if(!auth.status){
        logger.warn("PostAnswerImage : Invalid Id or Password");
        sdc.timing("webapp.api.deleteImageQuestion.apiTime",date1);
        response.status(401).send();
    }else{
        const question_id= request.params.qid;   
        //Convert it to file
        const quesObj = await questionService.findbyid(question_id);
        if(quesObj == null){
            sdc.timing("webapp.api.deleteImageQuestion.apiTime",date1);
            logger.warn("PostAnswerImage : No image is passed by user");
            response.status(400).send();
        }else if(quesObj.user_id != auth.id ){
            logger.warn("PostAnswerImage : Unauthenticated User");
            sdc.timing("webapp.api.deleteImageQuestion.apiTime",date1);
            response.status(401).send();
        }else{
            const quesObj = await questionService.findbyid(question_id);
            if(quesObj.user_id != auth.id){
                response.status(401).send();
            }else{
            try{
                const file = await fileService.findbyId(request.params.fid);
                
                let date2 = new Date();
                uploadService.delete(file.s3_object_name);
                sdc.timing("webapp.api.deleteImageQuestion.imageTime",date2);
                
                let date3 = new Date();
                const res= await fileService.removeQuestionImage(request.params.fid,question_id);
                sdc.timing("webapp.api.deleteImageQuestion.dbTime",date3);
                
                sdc.timing("webapp.api.deleteImageQuestion.apiTime",date1);
                logger.info('deleteQuestionImage : File is deleted');
                response.status(204).send();
            }catch(e){
                logger.error("PostAnswerImage : "+ e.message);

                sdc.timing("webapp.api.deleteImageQuestion.apiTime",date1);
               
                response.status(400).send();
            }
        }
    }
    }
}

exports.deleteAnswerImage = async(request, response)=>{
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        logger.error("PostAnswerImage : "+ e.message);
        sdc.timing("webapp.api.deleteImageAnswer.apiTime",date1);
        response.status(400).send();
    }
    if(!auth.status){
        sdc.timing("webapp.api.deleteImageAnswer.apiTime",date1);
        response.status(401).send();
    }else{
        const question_id= request.params.qid; 
        const answer_id = request.params.aid;  
        //Convert it to file
        const quesObj = await answerService.find(question_id, answer_id);
        if(quesObj.length == 0){
            sdc.timing("webapp.api.deleteImageAnswer.apiTime",date1);
            response.status(400).send();
        }else if(quesObj[0].user_id != auth.id ){
            sdc.timing("webapp.api.deleteImageAnswer.apiTime",date1);
            response.status(401).send();
        }else{
            try{
                const file = await fileService.findbyId(request.params.fid);
                let date2 = new Date();
                uploadService.delete(file.s3_object_name);                
                sdc.timing("webapp.api.deleteImageAnswer.imageTime",date2);

                let date3 = new Date();
                const res= await fileService.removeAnswerImage(request.params.fid,answer_id);
                sdc.timing("webapp.api.deleteImageAnswer.dbTime",date3);
                
                sdc.timing("webapp.api.deleteImageAnswer.apiTime",date1);
                response.status(204).send();
                logger.info('deleteAnswerImage : File is deleted');
            }catch(e){
                logger.error("PostAnswerImage : "+ e.message);
                sdc.timing("webapp.api.deleteImageAnswer.apiTime",date1);
                response.status(400).send();
            }
        }
    }
}
