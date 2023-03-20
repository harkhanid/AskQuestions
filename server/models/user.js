//const { Sequelize } = require("sequelize/types");

module.exports = (sequelize,type) =>{
    return sequelize.define('User',{
        id:{
            type:type.UUID,
            defaultValue:type.UUIDV1,
            primaryKey:true,
            autoIncrement:false
        },
        first_name:type.STRING(30),
        last_name:type.STRING,
        username:{
            type:type.STRING(30),
            unique:true
        },
        password:type.STRING,
        account_created:{
            type:type.DATE,
            defaultValue:Date.now
        },
        account_updated:{
            type:type.DATE,
            defaultValue:Date.now
        }
    },{
        timestamps:false
    });
}