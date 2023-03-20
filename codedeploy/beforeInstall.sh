#!/bin/bash
cd ~

sudo rm -f webapp.zip
sudo rm -f version.txt
sudo rm -rf webapp

PID=`sudo ps -ef | grep node | grep -v grep | awk '{print $2}'` 

if [[ "" !=  "$PID" ]]; then
  echo "killing $PID"
  kill -9 $PID
fi