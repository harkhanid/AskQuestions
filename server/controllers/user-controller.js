const request = require('express');
const response = require('express');
const bcrypt = require('bcrypt');
const sns = require('../services/sns');
const db = require("../models");
const { Sequelize } = require('../models');
e//const Op = db.Sequelize.Op;


const logger = require('../config/logger').logger;
const sdc = require('../config/statsd').sdc;

 exports.getUser = async(request,response) =>{
    sdc.increment('webapp.api.getUser.count');
    let date1= new Date();
    if(request.headers.authorization == undefined){
        logger.warn("getUser : unauthorized user tried to log in");
        sdc.timing('webapp.api.getUser.apiTime',date1);
        response.status(401).send();
    }else{
        const encodedString = request.headers.authorization.split(' ')[1];
        const decodedString = Buffer.from(encodedString, 'base64').toString('ascii');
        
        const username = decodedString.split(':')[0];
        const password = decodedString.split(':')[1];
        
        let date2 = new Date();
        let findPass = await Users.findAll({
            where:{username:username}
        }); 
        
        sdc.timing('webapp.api.getUser.dbTime',date2);
        
        if(findPass.length == 0){
            sdc.timing('webapp.api.getUser.apiTime',date1);
            logger.warn("getUser : unauthorized user tried to log in");
            response.status(401).send();
        }else {
            comparePassword(password,findPass[0].password).then((res1)=>{
                if(!res1){
                    sdc.timing('webapp.api.getUser.apiTime',date1);
                    logger.warn("getUser : user tried incorrect password");
                    response.status(400).send({message:"error"});
                }else{
                    sdc.timing('webapp.api.getUser.apiTime',date1);
                    response.status(200).send({
                        "id" : findPass[0].id,
                        "first_name":findPass[0].first_name,
                        "last_name":findPass[0].last_name,
                        "username":findPass[0].username,
                        "account_created" :findPass[0].account_created,
                        "account_updated":findPass[0].account_updated
                    });
                };
            })
        }
    }
};


exports.updateUser = async(request,response) =>{
    sdc.increment('webapp.api.updateUser.count');
    let date1 = new Date();
    if(request.headers.authorization == undefined){
        logger.warn("UpdateUser : unauthorized user tried to log in");
        response.status(401).send();
    }else{
    const encodedString = request.headers.authorization.split(' ')[1];
    const decodedString = Buffer.from(encodedString, 'base64').toString('ascii');
    
    const username = decodedString.split(':')[0];
    const password = decodedString.split(':')[1];
    
    let findPass = await Users.findAll({
        where:{username:username}
    }); 

    if(findPass.length == 0){
        logger.warn("UpdateUser : unauthorized user tried to log in");
        sdc.timing('webapp.api.updateUser.apiTime',date1);
        response.status(400).send();
        return false;
    }else if(request.body.first_name == undefined
         || request.body.last_name == undefined || request.body.password == undefined){
            logger.warn("UpdateUser : User has passed Wrong parameters");
        
            sdc.timing('webapp.api.updateUser.apiTime',date1);
            response.status(400).send()
    }else
     if(request.body.account_created || request.body.account_updated){
        logger.warn("UpdateUser : user tried to manipulate unauthorized data");
        sdc.timing('webapp.api.updateUser.apiTime',date1);
        response.status(400).send();
    }else{
        console.log("USERNAME"+request.body.username);
        comparePassword(password,findPass[0].password).then((res1)=>{
            if(!res1){
                sdc.timing('webapp.api.updateUser.apiTime',date1);
                logger.warn("UpdateUser : user tried to log in with wrong password");
                response.status(400).send();
            }else if(!validatePassword(request.body.password)){
                sdc.timing('webapp.api.updateUser.apiTime',date1);
                response.status(400).send({message:"new password is weak."});
            }
            else{
                hashPassword = bcrypt.hashSync(request.body.password,bcrypt.genSaltSync(10));
                let date2 = new Date();
                Users.update({
                    first_name:request.body.first_name,
                    last_name:request.body.last_name,
                    password:hashPassword,
                    account_updated: new Date()
                },{
                    where:{username:username}
                }).then(res=>{
                    sdc.timing('webapp.api.updateUser.dbTime',date2);
                    sdc.timing('webapp.api.updateUser.apiTime',date1);
                    logger.info('updateUser : User data is updated');
                    response.status(204).send();  
                }).catch((error)=>{
                    logger.error("UpdateUser : "+ e.message);
                    sdc.timing('webapp.api.updateUser.apiTime',date1);
                    response.status(400).send();
                });
            }
        });
    }
    }
};

exports.create =(request,response) =>{
    sdc.increment('webapp.api.createUser.count');
    let date1 = new Date();
    if(! request.body){
        sdc.timing('webapp.api.createUser.apiTime',date1);
        logger.warn("CreateUser : no body is passed ");
        console.log("NO BODY");
        response.status(400).send();  
    }
    if( !request.body.username || !request.body.first_name  || !request.body.last_name
        || !request.body.password){
        sdc.timing('webapp.api.createUser.apiTime',date1);
        logger.warn("CreateUser : user passed invalid data");
        console.log("NO BODY1");
        response.status(400).send();
    }else{
        Users.findAll({
            where:{
                username:request.body.username
            }
        }).then((find)=>{
            if(find.length != 0){
                sdc.timing('webapp.api.createUser.apiTime',date1);
                console.log("NO BODY2");
                response.status(400).send();
            }else{
                if(!validateEmail(request.body.username)){
                    sdc.timing('webapp.api.createUser.apiTime',date1);
                    logger.warn("CreateUser : user entered invalid email");
                    console.log("NO BODY3");
                    response.status(400).send({message:"Username is Invalid."});
                }else if(!validatePassword(request.body.password)){
                    sdc.timing('webapp.api.createUser.apiTime',date1);
                    logger.warn("create User API: User is setting weak password");
                    console.log("NO BODY4");
                    response.status(400).send();
                }else{
                    hashPassword = bcrypt.hashSync(request.body.password,bcrypt.genSaltSync(10));
                    console.log(hashPassword);
                    const user = {
                    username:request.body.username,
                    first_name:request.body.first_name,
                    last_name:request.body.last_name,
                    password:hashPassword,
                }
                let date2 = new Date();
                Users.create(user)
                .then((res)=>{
                        sdc.timing('webapp.api.createUser.dbTime',date2);
                        sdc.timing('webapp.api.createUser.apiTime',date1);
                        logger.info('createUser : User is Created')
                        response.status(201)
                        .send({
                            "id" : res.id,
                            "first_name":res.first_name,
                            "last_name":res.last_name,
                            "username":res.username,
                            "account_created" : new Date(res.account_created),
                            "account_updated":  new Date(res.account_updated)
                        });
                        //sns.PublishTopic("User is created");
                })
                .catch(error=>{
                    logger.error("createUser : "+error.message);
                    console.log("error",error);
                    response.status(400).send();
                });
            }
        }
        });
     
    }
    
};

exports.getUserById = async(request, response ) =>{
    sdc.increment('webapp.api.getUserbyID.count');
    let date1 = new Date();
    let user_id = request.params.id;
    if(user_id =='self'){
        this.getUser(request,response);
    }else{
        try{
            let date2= new Date();
            let findPass = await Users.findAll({
                where:{id:user_id},
                attributes:{
                    exclude:['password']
                }
            });
            sdc.timing('webapp.api.getUserID.dbTime',date2);
            if(findPass.length == 0){
                sdc.timing('webapp.api.getUserID.apiTime',date2);
                logger.warn("CreateUser : unautherized user tried to log in");
                response.status(401).send();
            }else{
                sdc.timing('webapp.api.getUserID.apiTime',date2);
                response.status(200).send(findPass[0]);
    
            }
        }catch(e){
            logger.error('GetUserID : '+e.message)
            sdc.timing('webapp.api.getUserID.apiTime',date2);
            response.status(400).send();
        }
    }
};

const comparePassword =  async(password,hashPassword) =>{
    return bcrypt.compareSync(password,hashPassword);
}

const validateEmail = (email) =>{
    if (email.match(/(\S+)@(\S+\.\S+)/gi) != null){
    return true;
  }else{
    return false;
  }
}

const validatePassword = (password) =>{
    if (password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/) != null){
    return true;
  }else{
    return false;
  }
}
