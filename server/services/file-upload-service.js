const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

aws.config.update({
    region:process.env.s3_region
})

const s3 = new aws.S3();

exports.delete = async (name)=>{
  await s3.deleteObject({
    Key:name,
    Bucket: process.env.s3_bucket
  }).promise();
  return{};
}

exports.upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.s3_bucket,
    metadata: function (req, file, cb) {
      cb(null, {'file_name':file.originalname});
    },
    key: function (req, file, cb) {
      cb(null, req.params.id+'/'+Date.now()+"_"+file.originalname)
    }
  })
})

//module.exports=upload;
