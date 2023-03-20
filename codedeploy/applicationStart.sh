#!/bin/bash
set -v
cd ~

vers=`cat version.txt`
export version_num="$vers"

cd webapp

npm install 

pwd
ls -al



nohup npm run start > /dev/null 2>&1 &
echo $! > save_pid.txt

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/home/ubuntu/CloudWatchConfig/cloud-watch-config.json \
    -s