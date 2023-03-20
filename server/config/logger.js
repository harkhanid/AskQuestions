const winston   = require('winston');
//const CloudWatchTransport = require('winston-aws-cloudwatch');

let NODE_ENV = process.env.NODE_ENV || 'development';


const logger    = winston.createLogger({
    transports:[
        new winston.transports.File({filename:'webapp.log',level:'info'})
    ]
});

logger.info("Version "+ process.env.version_num +" Is deployed on EC2 instance")

exports.logger = logger;
