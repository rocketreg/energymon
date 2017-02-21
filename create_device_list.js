// https://blog.xervo.io/nodejs-and-sqlite
// http://www.sqlitetutorial.net/sqlite-create-table/

// creates a list of devices posting on sm06

var fs = require("fs");
//var file = "emon.db";
//var exists = fs.existsSync(file);
var mqtt = require('mqtt');
var url = 'mqtt://54.171.49.167:1883';
var count = 0;
var devices = [];
console.log("start: " + devices);
var client  = mqtt.connect(url);
client.on('connect', function () {
  client.subscribe('sm06/#')
})

function search(deviceKey, devices) {
//  console.log("deviceKey: " + deviceKey);
  exists = false;
  for(var i = 0; i < devices.length; i++) {   
    if (JSON.stringify(devices[i].device) === deviceKey) {
      exists = true;
      break;
    } 
  } 
  return exists;
}

//get sensor data
client.on('message', function (topic, message, packet) {
  count++
  if (count === 200) {
    fs.writeFile("device.json", JSON.stringify(devices), function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved");
    });
    console.log(devices);
    client.end();
  }
  var str = JSON.stringify(topic);
  // only sensors with channels
  if(str[48] === "/") {
    var device = str.slice(6,50);  // strip unwanted parts
    var d = new Date();
    var n = d.toLocaleTimeString();
    var watts = message.toString();
    var exists = null;
//	add quotes to string to make search work
    devKey = '"'+device+'"';
    exists = search(devKey, devices);
    console.log("exists: " + exists + " devices length: " + devices.length);
//  we don't want duplicates
    if(!exists) {    
      devices.push({'device': device});
    }
  } 
});


