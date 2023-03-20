const question = (sequelize,type) =>{
    return sequelize.define('Question',{
        question_id:{
            type:type.UUID,
            defaultValue:type.UUIDV1,
            primaryKey:true,
            autoIncrement:false
        },
        question_text:type.STRING(100),
        user_id:type.UUID,
        created_timestamp:{
            type:type.DATE,
            defaultValue:Date.now
        },
        updated_timestamp:{
            type:type.DATE,
            defaultValue:Date.now
        }
    },{
        timestamps:false
    });
}

module.exports = question;