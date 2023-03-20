const request = require('express');
const response = require('express');
const bcrypt = require('bcrypt');

const db = require("../models");
const { Sequelize } = require('../models');
const Users = db.users;
//const Op = db.Sequelize.Op;

 exports.authenticateUser = async(request,response) =>{
    return new Promise(async(resolve)=>{
            if(request.headers.authorization == undefined){
                resolve({status:false,id:undefined});
            }else{
                const encodedString = request.headers.authorization.split(' ')[1];
                const decodedString = Buffer.from(encodedString, 'base64').toString('ascii');
                
                const username = decodedString.split(':')[0];
                const password = decodedString.split(':')[1];
                
                let findPass = await Users.findAll({
                    where:{username:username}
                }); 
                
                if(findPass.length == 0){
                    resolve({status:false,id:undefined});
                }else {
                    comparePassword(password,findPass[0].password).then((res1)=>{
                        if(!res1){
                            resolve({status:false,id:undefined});
                        }else{
                            resolve({status:true,id:findPass[0].id});
                        };
                    })
                }
            }    
    });
};


const comparePassword =  async(password,hashPassword) =>{
    return bcrypt.compareSync(password,hashPassword);
}

