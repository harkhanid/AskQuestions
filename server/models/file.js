//const { Sequelize } = require("sequelize/types");
const answer = (sequelize,type) =>{
    return sequelize.define('File',{
        file_id:{
            type:type.UUID,
            defaultValue:type.UUIDV1,
            primaryKey:true,
            autoIncrement:false
        },
        s3_object_name:{
            type:type.STRING(100),
        },
        file_name:{
            type:type.STRING(100),
        },
        file_size:{
            type:type.STRING(100),
        },
        file_storage_class:{
            type:type.STRING(100),
        },
        
        created_date:{
            type:type.DATE,
            defaultValue:Date.now
        }
    },{
        timestamps:false
    });
}


module.exports = answer;