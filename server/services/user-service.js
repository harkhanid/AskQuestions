const request = require('express');
const response = require('express');
const bcrypt = require('bcrypt');
const sns = require('../services/sns');
const db = require("../models");
const { Sequelize } = require('../models');
const Users = db.users;
//const Op = db.Sequelize.Op;


exports.getemailbyID = (id) =>{
    const promise = Users.findOne({
        where:{ id : id }
    });
    return promise;
};