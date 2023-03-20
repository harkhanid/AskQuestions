const aws = require('aws-sdk');
const logger = require('../config/logger').logger;

aws.config.update({
    region: "us-east-1",
})

const TopicARN = process.env.TopicArn;
const sns = new aws.SNS();

exports.PublishTopic = async (message) =>{
    let params = {
        Message : message,
        TopicArn: TopicARN 
    };
    let resp;
    try{
        resp  =sns.publish(params).promise();
         // Handle promise's fulfilled/rejected states
         resp.then(
            function(data) {
                console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
                console.log("MessageID is " + data.MessageId);
            }).catch(
            function(err) {
            console.error(err, err.stack);
            });
        }
    catch {
        logger.warn("Could Not sent mail SNS");   
    }
    return resp;

}

