const SDC = require('statsd-client');

let sdc = new SDC({host:'localhost',port:8125});

exports.sdc = sdc;