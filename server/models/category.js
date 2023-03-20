//const { Sequelize } = require("sequelize/types");
const Question = require('./question');
const categ = (sequelize,type) =>{
    return sequelize.define('Category',{
        id:{
            type:type.UUID,
            defaultValue:type.UUIDV1,
            primaryKey:true,
            autoIncrement:false
        },
        category:{
            type:type.STRING(30),
            unique:true
        // },
        // account_created:{
        //     type:type.DATE,
        //     defaultValue:Date.now
        // },
        // account_updated:{
        //     type:type.DATE,
        //     defaultValue:Date.now
        }
    },{
        timestamps:false
    });
}


module.exports = categ;