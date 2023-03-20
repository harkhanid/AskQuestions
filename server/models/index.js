const { request } = require('express');
const Sequelize = require('sequelize');
const userModel         = require('./user');
const questionModel     = require('./question');
const categoryModel     = require('./category');
const AnswerModel       = require('./answers');
const fileModel         = require('./file');

let db={}; 
if(process.env.NODE_ENV === 'test' ){
    console.log("TEST DATABASE");
    const SequelizeMock = require('sequelize-mock');
    const sequelizeMock = new SequelizeMock(Sequelize);
    const UserMock = sequelizeMock.define('users', {
        'first_name': 'apple@gmail.com',
        'username': 'blink',
        'last_name': 'asas',
    }, {
        instanceMethods: {
            myTestFunc: function () {
                return 'Test User';
            },
        },
    });

    db.Sequelize=SequelizeMock;
    db.sequelize=sequelizeMock;
    db.users = UserMock;
    
}else{
    const hostArray = process.env.db_host.split(':');
    const sequelize = new Sequelize(process.env.db_name,process.env.db_username,process.env.db_password,{
    //const sequelize = new Sequelize("webapp_database","root","Dharmik@123",{
    host:hostArray[0],
    //host:'localhost',  
    dialect:'mysql',
    dialectOptions: {
        ssl: 'Amazon RDS',
        rejectUnauthorized: true,
    },
        pool:{ 
            max:10,
            min:0,
            acquire:30000,
            idle:10000,
        }
    });
    
    db.Sequelize=Sequelize;
    db.sequelize=sequelize;
    
    db.users = userModel(sequelize, Sequelize);
    db.questions = questionModel(sequelize,Sequelize);
    db.category = categoryModel(sequelize,Sequelize);
    db.answers = AnswerModel(sequelize,Sequelize);
    db.files = fileModel(sequelize,Sequelize);

    db.questions.belongsToMany(db.category,{ through:"QuestionCategory"});
    db.category.belongsToMany(db.questions,{ through:"QuestionCategory"});

    db.questions.hasMany(db.answers);
    db.answers.belongsTo(db.questions,{foreignKey: {
        allowNull:false
    }});
    
    db.questions.hasMany(db.files);
    db.files.belongsTo(db.questions,{foreignKey: {
        allowNull:true
    }});
    
    db.answers.hasMany(db.files);
    db.files.belongsTo(db.answers,{foreignKey: {
        allowNull:true
    }});

    sequelize.sync();
}

module.exports = db;