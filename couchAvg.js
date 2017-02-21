// https://blog.xervo.io/nodejs-and-sqlite
// http://www.sqlitetutorial.net/sqlite-create-table/

var fs = require("fs");
var moment = require('moment');
var mqtt = require('mqtt');
var url = 'mqtt://54.171.49.167:1883';
var start = moment().valueOf();
var devices = require('./device.json');
var client  = mqtt.connect(url);
var filename = 'data/start';
var nano = require('nano')('http://localhost:5984');
var test_db = nano.db.use('test_db');
// connect to mqtt
client.on('connect', function () {
  client.subscribe('sm06/#')
})

// store data in couchdb
function couchdb(data) {
  test_db.insert(data, function(err, body){
    if(!err){
      console.log('data stored in test_db');
    }
  });
}

client.on('message', function (topic, message, packet) {  
// Get start time for data file
  var str = JSON.stringify(topic);
  var device = str.slice(6,50);  // strip unwanted characters
  var d = moment().valueOf();
  var watts = message.toString();
//	add quotes to string to make search work
  var devKey = '"'+device+'"';
//  is this device on the list?
  for(var i = 0; i < devices.length; i++) {   
    if (JSON.stringify(devices[i].device) === devKey) {
      var tStamp = devices[i].tStamp || start;
      var timeNow = moment().valueOf();
    // time period of averages
      if(timeNow > tStamp + 300000) {
        devices[i].tStamp = timeNow;
        sum = devices[i].sum || 0;
        sum += parseInt(watts,10);
        devices[i].sum = sum;
        count = devices[i].count || 0;
        count++;
        devices[i].count = count;
        avg = sum/count;
        devices[i].avg = avg.toFixed(2);
        couchdb(devices[i]);
        break;
      } 
    } 
  }
});

 


