// https://blog.xervo.io/nodejs-and-sqlite
// http://www.sqlitetutorial.net/sqlite-create-table/

var fs = require("fs");
var moment = require('moment');
var mqtt = require('mqtt');
var url = 'mqtt://54.171.49.167:1883';
var start = moment().valueOf();
var devices = require('./device.json');

var client  = mqtt.connect(url);
client.on('connect', function () {
  client.subscribe('sm06/#')
})

function fileTimer() {
  var d = new Date();
  var n = d.getMinutes();
//  console.log("minutes: "+n);
}
//get sensor data
client.on('message', function (topic, message, packet) {  
  var str = JSON.stringify(topic);
  var device = str.slice(6,50);  // strip unwanted parts
  var d = moment().valueOf();
  var watts = message.toString();
//	add quotes to string to make search work
  var devKey = '"'+device+'"';
//  is this device on the list?
  for(var i = 0; i < devices.length; i++) {   
    console.log("devices: " + JSON.stringify(devices[i].device));
    if (JSON.stringify(devices[i].device) === devKey) {
      var tStamp = devices[i].tStamp || start;
      var timeNow = moment().valueOf();
      if(timeNow > tStamp + 120000) {
        console.log(fileTimer());
        devices[i].tStamp = timeNow;
        console.log("devices"+JSON.stringify(devices));
      sum = devices[i].sum || 0;
      sum += parseInt(watts,10);
      devices[i].sum = sum;
      count = devices[i].count || 0;
      count++;
      devices[i].count = count;
      avg = sum/count;
      devices[i].avg = avg.toFixed(2);
      break;
      } /*
    } 

    var d = new Date();
    var n = d.getMinutes();
    var previous = null;
    
    if(n % 2 === 0 ) {
      
      if(previous !== n){
        console.log("The file was saved"); 
      }
      done = true;
     */ 
    } /*
      var filename = ("data/data" + d.getTime().toString() +".json");
      fs.writeFile(filename, JSON.stringify(devices), function(err) {
        if(err) {
          return console.log(err);
        }  
        console.log("The file was saved");
      }); 
    } */
  }
});


