const fs=require('fs');
const os = require('os');

const configPath=os.homedir()+"/opt/configDB.json";
const parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

const configPath1=os.homedir()+"/opt/configS3.json";
const parsed1 = JSON.parse(fs.readFileSync(configPath1, 'UTF-8'));


exports.configS3 = parsed1;
exports.configDB = parsed;
