process.env.NODE_ENV='test';

const expect = require('chai').expect;
const request = require('supertest');
const express = require('express');
const router = express.Router();
const app = require('.././app');
const conn = require('../server/models/index');

describe('POST /user', ()=>{
    before((done) =>{
        conn.sequelize.sync()
        .then(()=>done())
        .catch((err)=>{
            console.log(err);
        });
    })
})

it('OK, Checking for duplicate username',(done)=>{
    request(app).post('/user')
    .set('content-type','application/json')
    .send({	
        "first_name":"Akash",
        "last_name":"Boda",
        "username":"apple@gmail.com",
        "password":"Akash123$"
    })
    .then(res=>{
        const body = res.body;
        console.log("----",res.body);
        expect(res.statusCode).to.equal(400);
        done();
        
    }).catch(error => {
        console.log(error);
    });
})

// it('checking mock test', (done)=>{
//     expect(2+1).to.equal(3);
    
//     done();
// });