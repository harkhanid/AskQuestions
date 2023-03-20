const db = require("../models");
const { Sequelize } = require('../models');
const category = require("../models/category");
//const e = require('express');
const Category = db.category;

exports.save = (category) =>{
    const newCategory = new Category(category);
    const promise = newCategory.save();
    return promise;
}

exports.find = (catg) =>{
    const promise = Category.findAll({
        where:{
            category: catg
        }
    });
    return promise;
}

