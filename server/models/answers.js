//const { Sequelize } = require("sequelize/types");
const answer = (sequelize,type) =>{
    return sequelize.define('Answer',{
        answer_id:{
            type:type.UUID,
            defaultValue:type.UUIDV1,
            primaryKey:true,
            autoIncrement:false
        },
        user_id:type.UUID,
        answer_text:{
            type:type.STRING(100),
        },
        created_timestamp:{
            type:type.DATE,
            defaultValue:Date.now
        },
        updated_timestamp:{
            type:type.DATE,
            defaultValue:Date.now
        },
    },{
        timestamps:false
    });
}


module.exports = answer;