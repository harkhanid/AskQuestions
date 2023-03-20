// describe('/user ', function(){
//     let dbStub;
//     let loggerStub;
//     let debugStub;
//     let app;

//     before(function(){
//         dbStub={
//             run:function(){
//                 return Promise.resolve({
//                     stat:{
//                         lastId:1349
//                     }
//                 });
//             }
//         }
//         dbStub['@global']=true;
        
//         loggerStub=sinon.
//             stub(logger,'morgan')
//             .returns(function(req,res,next){
//                 next();
//             })
        
//         debugStub = function(){
//             return simon.stub();
//         }
//         debugStub['@global']=true;

//         app = proxyquire('../../app',{
//             sqlite:dbStub,
//             morgon:loggerStub,
//             debug:debugStub
//         });
//     });

//     after(function(){
//         loggerStub.restore();
//     });

//     context('GET', function(){
//         it('should return ',function(done){
//             chai.request(app)
//             .get('/user/self')
//             .end(function(err,res){
//                 res.should.have.status(200);
//                 done(err);
//             })
//         });
//     })
// });