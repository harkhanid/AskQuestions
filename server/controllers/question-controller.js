const request = require('express');
const response = require('express');
const bcrypt = require('bcrypt');
const {"v4": uuidv4} = require('uuid');
const questionService = require('../services/question-service');
const categoryService = require('../services/category-service');
const answerService = require('../services/answer-service');
const Validation = require('../services/validation-service');
const fileService = require('../services/file-dbstore-service');
const uploadService = require('../services/file-upload-service');
const userService = require('../services/user-service');
const sns = require('../services/sns');

const category = require('../models/category');
const question = require('../models/question');
const answer = require('../models/answers');
const { questions } = require('../models');
//const { UUIDV4 } = require('sequelize/types');

const logger = require('../config/logger').logger;
const sdc = require('../config/statsd').sdc;


exports.createQuestion = async(request,response) =>{
    sdc.increment('webapp.api.createQuestion.count');
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        logger.error("CreateQuestion: "+e.message);
        sdc.timing("webapp.api.CreateQuestion.apiTime",date1);
        response.status(400).send();
    } 

    //Validating and creating Copy Object
    if(!auth.status){
        sdc.timing("webapp.api.CreateQuestion.apiTime",date1);
        response.status(401).send();
    }else if(request.body.created_timestamp || request.body.updated_timestamp|| 
        request.body.question_id || !request.body.question_text){
        logger.warn("createQuestion : user tried to enter invalid data");
        sdc.timing("webapp.api.CreateQuestion.apiTime",date1);
        response.status(400).send();
    }else{
        let body = Object.assign({},request.body);
        body.user_id = auth.id;
        let QuestionObj=null;
        try{
            let date3 = new Date();
            QuestionObj= await questionService.save(body,response);
            sdc.timing("webapp.api.CreateQuestion.addQuestion.dbTime",date1);
        }catch(e){
            logger.error("CreateQuestion: "+e.message);
            sdc.timing("webapp.api.CreateQuestion.apiTime",date1);
            response.status(400).send();
        }
    
        //Adding Category
        let date2 = new Date();
        for(let x of body.categories){
            let foundCategory = await categoryService.find(x.category.toLowerCase());
            if(foundCategory.length == 0){
                //add a new category
                foundCategory = await categoryService.save({"category":x.category.toLowerCase()});
            }else{
                //get the found category ID.
                foundCategory = foundCategory[0]; 
            }
            const res1= await QuestionObj.addCategory(foundCategory,{ through: { selfGranted: false }});
        }
        sdc.timing("webapp.api.CreateQuestion.AddCategory.dbTime",date2);
        let result=null;
        try{
            result = await questionService.findbyid(QuestionObj.question_id);
            sdc.timing("webapp.api.CreateQuestion.apiTime",date1);
            logger.info('createQuestion : New Question is created');
            response.status(201).send(result); 
        }catch(e){
            logger.error("CreateQuestion: "+e.message);
            sdc.timing("webapp.api.CreateQuestion.apiTime",date1);
            response.status(400).send();
        } 
    } 
};

exports.createAnswer = async(request, response)=>{
    sdc.increment('webapp.api.createAnswer.count');
    let date1 = new Date();
    let auth;

    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        logger.error("PostAnswerImage : "+ e.message);
        sdc.timing("webapp.api.CreateAnswer.apiTime",date1);
        response.status(400).send();
    }

    //Validating User
    if(! auth.status){
        sdc.timing("webapp.api.CreateAnswer.apiTime",date1);
        response.status(401).send();
    }else if(request.body.created_timestamp || request.body.updated_timestamp 
        || request.body.answer_id || !request.body.answer_text){
        sdc.timing("webapp.api.CreateAnswer.apiTime",date1);
        logger.warn("createAnswer : user tried to enter invalid data");
        response.status(400).send();
    }else{
    
        const questionId= request.params.id;
        const quesObj = await questionService.findbyid(questionId);
        if(quesObj == null){
            sdc.timing("webapp.api.CreateAnswer.apiTime",date1);
            
            response.status(400).send();
        }else{
            let body = Object.assign({},request.body);
            body.user_id = auth.id;
            let newAns;
            try{
                let date2 = new Date();
                newAns = await answerService.save({
                    answer_text:body.answer_text,
                    QuestionQuestionId:questionId,
                    user_id:body.user_id
                });
                const respUser= await userService.getemailbyID(quesObj.user_id);
                let jsonMessage={};
                jsonMessage.receiver = respUser.username;
                jsonMessage.name = respUser.first_name + ' '+ respUser.last_name;
                jsonMessage.questionId = newAns.QuestionQuestionId;
                jsonMessage.answerId = newAns.answer_id;
                jsonMessage.id = uuidv4();
                jsonMessage.apiAction = "Insert";
                jsonMessage.domain = process.env.domain;
                jsonMessage.answerText = body.answer_text;
                jsonMessage.userId = body.user_id;
                
                jsonMessage.link = "http://"+process.env.domain+"/question/"+ newAns.QuestionQuestionId+'/answer/'+newAns.answer_id;

                console.log("MESSAGE: STRING::",JSON.stringify(jsonMessage));
                sns.PublishTopic(JSON.stringify(jsonMessage));
                // setTimeout(()=>{
                //     console.log("Timeout");
                //     jsonMessage.name = "TIMEOUT";
                //     sns.PublishTopic(JSON.stringify(jsonMessage));
                // },10000);
                sdc.timing("webapp.api.CreateAnswer.AddAnswer.dbTime",date2);
                sdc.timing("webapp.api.CreateAnswer.apiTime",date1);  
                logger.info('createAnswer : New Answer is created');  
                response.status(201).send(newAns);
            }catch(e){
                console.log(e);
                logger.error("PostAnswerImage : "+ e.message);
                sdc.timing("webapp.api.CreateAnswer.apiTime",date1);
                response.status(400).send();
            }
        }
    }
};

exports.deleteQuestion = async(request, response)=>{
    sdc.increment('webapp.api.deleteQuestion.count');
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        logger.error("PostAnswerImage : "+ e.message);
        sdc.timing("webapp.api.deleteQuestion.apiTime",date1);
        response.status(400).send();
    }
    if(!auth.status){
        sdc.timing("webapp.api.deleteQuestion.apiTime",date1);
        response.status(401).send();
    }else{


        const questionId= request.params.id;
        try{
            const quesObj = await questionService.findbyid(questionId);
            if(quesObj.user_id != auth.id){
                sdc.timing("webapp.api.deleteQuestion.apiTime",date1);
                logger.warn("Delete Question : Unauthorized user tried to delete question");
                response.status(401).send();
            }else if(quesObj.Answers.length != 0){
                sdc.timing("webapp.api.deleteQuestion.apiTime",date1);
                logger.warn("Delete Question : user tried to delete question that has answers");
                response.status(400).send({message:"Question has answers"});
            }else{
                const arrFile=await fileService.findAllQbyId(questionId);
                arrFile.forEach(async(element) => {
                    let date2 = new Date();
                    uploadService.delete(element.s3_object_name);
                    sdc.timing("webapp.api.DeleteQuestion.removeFIle.imageTime",date1);
                    let date3 = new Date();
                    const res= await fileService.removeQuestionImage(element.file_id,questionId);
                    sdc.timing("webapp.api.DeleteQuestion.removeImage.dbTime",date1);
                });
                let date4 = new Date();
                const res= await questionService.remove(questionId);
                sdc.timing("webapp.api.deleteQuestion.removeQuestion.dbTime",date1);
                sdc.timing("webapp.api.deleteQuestion.apiTime",date1);
                logger.info('deleteQuestion : Question is deleted');
                response.status(204).send();
            }
        }catch(e){
            logger.error("PostAnswerImage : "+ e.message);
            sdc.timing("webapp.api.deleteQuestion.apiTime",date1);
            response.status(400).send();
        }
    }
}

exports.deleteAnswer = async(request, response)=>{
    sdc.increment('webapp.api.deleteAnswer.count');
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        sdc.timing("webapp.api.deleteAnswer.apiTime",date1);
        response.status(400).send();
    }
    if(!auth.status){
        sdc.timing("webapp.api.deleteAnswer.apiTime",date1);
        logger.warn("Delete Answer : Unauthorized user tried to delete");
        response.status(401).send();
    }else{
        const question_id= request.params.qid;
        const answer_id= request.params.aid;
        
        const quesObj = await answerService.find(question_id, answer_id);
        if(quesObj.length == 0){
            sdc.timing("webapp.api.deleteAnswer.apiTime",date1);
            logger.warn("Delete Answer : Unauthorized user tried to delete answer that does not exist");
            response.status(400).send();
        }else if(quesObj[0].user_id != auth.id ){
            sdc.timing("webapp.api.deleteAnswer.apiTime",date1);
            response.status(401).send();
        }else{
            try{
                const arrFile=await fileService.findAllAbyId(answer_id);
                arrFile.forEach(async(element) => {
                    let date2 = new Date();
                    uploadService.delete(element.s3_object_name);
                    sdc.timing("webapp.api.deleteQuestion.removeImage.imageTime",date2);
                    let date3 = new Date();
                    const res= await fileService.removeAnswerImage(element.file_id,answer_id);
                    sdc.timing("webapp.api.deleteQuestion.removeImage.dbTime",date3);
                });
                let date4 = new Date();
                const res= await answerService.remove(answer_id,question_id);
                const respUser= await userService.getemailbyID(quesObj[0].user_id)
                let jsonMessage={};
                
                jsonMessage.receiver = respUser.username;
                jsonMessage.name = respUser.first_name + ' '+ respUser.last_name;
                jsonMessage.questionId = question_id;
                jsonMessage.answerId = answer_id;
                jsonMessage.id = uuidv4();
                jsonMessage.apiAction = "Delete";
                jsonMessage.domain = process.env.domain;
                jsonMessage.answerText = null;
                jsonMessage.userId = respUser.id;
                jsonMessage.link = "http://"+process.env.domain+"/question/"+ question_id;
                console.log("MESSAGE: STRING::",JSON.stringify(jsonMessage));
                sns.PublishTopic(JSON.stringify(jsonMessage));

                logger.info('deleteAnswer : Answer is deleted');
                sdc.timing("webapp.api.deleteQuestion.removeImage.dbTime",date4);
                sdc.timing("webapp.api.deleteAnswer.apiTime",date1);
                response.status(204).send();
            }catch(e){
                logger.error("PostAnswerImage : "+ e.message);
                sdc.timing("webapp.api.deleteAnswer.apiTime",date1);
                response.status(400).send();
            }
        }
    }
}

exports.updateQuestion = async(request, response) =>{
    sdc.increment('webapp.api.updateQuestion.count');
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        logger.error("PostAnswerImage : "+ e.message);
        sdc.timing("webapp.api.updateQuestion.apiTime",date1);
        response.status(400).send();
    }
    if(!auth.status){
        sdc.timing("webapp.api.updateQuestion.apiTime",date1);
        logger.warn("UpdateQuestion : Unauthorized user tried to update");
        response.status(401).send();
    }else{
        const quesObj = await questionService.findbyid(request.params.id);
        if(quesObj == null){
            sdc.timing("webapp.api.updateQuestion.apiTime",date1);
            response.status(400).send();
        }else if(quesObj.user_id != auth.id ){
            sdc.timing("webapp.api.updateQuestion.apiTime",date1);
            logger.warn("UpdateQuestion : Unauthorized user tried to update");
            response.status(401).send();
        }else if(request.body.created_timestamp || request.body.updated_timestamp 
            || request.body.question_id || !request.body.question_text){
                sdc.timing("webapp.api.updateQuestion.apiTime",date1);
                logger.warn("UpdateQuestion : user tried to send invalid data");
                response.status(400).send();
        }else{ 
            const res = await questionService.findAllCatag(request.params.id);
            let QuestionObj = res[0];  
            let body = Object.assign({},request.body);
            body.updated_timestamp= new Date();
            for(x of res[0].Categories){
                try{
                    let date3 = new Date();
                    QuestionObj.removeCategory(x);
                    sdc.timing("webapp.api.updateQuestion.removeCategory.dbTime",date3);
                }catch(e){
                    logger.error("PostAnswerImage : "+ e.message);
                    sdc.timing("webapp.api.updateQuestion.apiTime",date1);
                    response.status(400).send();
                }
            }
            const res1 = await questionService.updateQuestion(request.params.id,body);
            for(let x of body.categories){
                let foundCategory = await categoryService.find(x.category.toLowerCase());
                if(foundCategory.length == 0){
                    //add a new category
                    let date4 = new Date();
                    foundCategory = await categoryService.save({"category":x.category.toLowerCase()});
                    sdc.timing("webapp.api.updateQuestion.addCategory.dbTime",date4);
                }else{
                    //get the found category ID.
                    foundCategory = foundCategory[0]; 
                }
                let date5 = new Date();
                QuestionObj.addCategory(foundCategory,{ through: { selfGranted: false }});
                sdc.timing("webapp.api.updateQuestion.updateQuestion.dbTime",date5);
            }
            sdc.timing("webapp.api.updateQuestion.apiTime",date1);
            response.status(204).send();
        }
    }   
};

exports.updateAnswer = async(request, response)=>{
    sdc.increment('webapp.api.updateAnswer.count');
    let date1 = new Date();
    let auth;
    //authorizing an user
    try{
        auth = await Validation.authenticateUser(request,response);
    }catch(e){
        logger.error("PostAnswerImage : "+ e.message);
        sdc.timing("webapp.api.updateAnswer.apiTime",date1);
        response.status(400).send();
    }
    if(!auth.status){
        sdc.timing("webapp.api.updateAnswer.apiTime",date1);

        logger.warn("updateAnswer : unauthorized user tried to send data");
        response.status(401).send();
    }else{
        question_id = request.params.qid;
        answer_id = request.params.aid;
        const quesObj = await answerService.find(question_id, answer_id);
        if(quesObj.length ==0){
            sdc.timing("webapp.api.updateAnswer.apiTime",date1);
            response.status(400).send();
        }else if(quesObj[0].user_id != auth.id ){
            sdc.timing("webapp.api.updateAnswer.apiTime",date1);
            response.status(401).send();
        }else if(request.body.created_timestamp || request.body.updated_timestamp 
            || request.body.answer_id || !request.body.answer_text){
                sdc.timing("webapp.api.updateAnswer.apiTime",date1);   
                logger.warn("updateAnswer : user tried to send invalid data");
            response.status(400).send();
        }else{
            let body = Object.assign({},request.body);
            body.updated_timestamp= new Date();
            try{
                let date2= new Date();
                const res = await answerService.update(question_id,answer_id,body);
                const respUser= await userService.getemailbyID(quesObj[0].user_id)
                let jsonMessage={};
                
                jsonMessage.receiver = respUser.username;
                jsonMessage.name = respUser.first_name + ' '+ respUser.last_name;
                jsonMessage.questionId = question_id;
                jsonMessage.answerId = answer_id;
                jsonMessage.id = uuidv4();
                jsonMessage.apiAction = "Update";
                jsonMessage.domain = process.env.domain;
                jsonMessage.answerText = body.answer_text;
                jsonMessage.userId = respUser.id;
                jsonMessage.link = "http://"+process.env.domain+"/question/"+question_id+'/answer/'+answer_id;

                console.log("MESSAGE: STRING::",JSON.stringify(jsonMessage));
                sns.PublishTopic(JSON.stringify(jsonMessage));
                console.log("result",res);
                console.log("resultID",res.answer_id);
                sdc.timing("webapp.api.updateAnswer.updateAnswer.dbTime",date2);
                sdc.timing("webapp.api.updateAnswer.apiTime",date1);
                response.status(204).send();
            }catch(e){
                logger.error("PostAnswerImage : "+ e.message);
                sdc.timing("webapp.api.updateAnswer.apiTime",date1);
                response.staus(400).send();
            }
        }

    }
};

exports.getAnswer = async(request,response) =>{
    sdc.increment('webapp.api.getAnswer.count');
    let date1 = new Date();
    question_id = request.params.qid;
    answer_id = request.params.aid;
    let date2 = new Date();
    let res = await answerService.find(question_id,answer_id);
    sdc.timing("webapp.api.getAnswer.getAnswer.dbTime",date2);
    if(res.length == 0){
        sdc.timing("webapp.api.getAnswer.apiTime",date1);
        response.status(400).send();
    }else{
        sdc.timing("webapp.api.getAnswer.apiTime",date1);
        response.status(200).send(res[0]);
    }

}

exports.getAllQuestions = async(request, response) =>{
    sdc.increment('webapp.api.getAllQuestions.count');
    let date1 = new Date();
    let date2 = new Date();
    const req = await questionService.list();
    sdc.timing("webapp.api.GetAllQuestions.GetAllQuestions.dbTime",date2);
    sdc.timing("webapp.api.GetAllQuestions.apiTime",date1);
    response.status(200).send(req);
}
exports.getQuestion = async(request, response) =>{
    let date1 = new Date();
    sdc.increment('webapp.api.getQuestion.count');
    let date2 = new Date();
    const req = await questionService.findbyid(request.params.id);
    sdc.timing("webapp.api.GetQuestion.GetQuestion.dbTime",date2);
    if(req == null){
        sdc.timing("webapp.api.GetQuestion.apiTime",date1);
        response.status(400).send();
    }else{
        sdc.timing("webapp.api.GetQuestion.apiTime",date1);
        response.status(200).send(req);        
    }
}

