/*
  This file is a sub program of Misty.js
  It handles all the clikc events on the frontend
*/

var ipAddress = document.getElementById('ip');
var connect = document.getElementById('connect');
var stopSkills = document.getElementById('stopSkills');
var questionaire = document.getElementById('questionaire');
var residentSearch = document.getElementById('residentSearch');
var facialRecognition = document.getElementById('facialRecognition');
var sleepPrevention = document.getElementById('sleepPrevention');
var getResidentBtn = document.getElementById('getResidentBtn');
var submitResident = document.getElementById('submit_resident');
//var takePhoto = document.getElementById('takePhotoBtn');
//var uploadImage = documanet.getElementById('res_image');
var ip;

/* Connects to Misty on click */
  connect.onclick = function(){
    var message = {
      success: "Successful Connection!",
      failure: "Connection Failed!"
    };
   
    ip = validateIPAddress(ipAddress.value);
      if (!ip) {
        console.log("IP address needed");
        document.getElementById("failure").innerHTML = message.failure;
        return;
      }
    console.log("Trying to connnect to misty..");
    client = new LightClient(ip, 10000);
    client.GetCommand("device", function (data) {
      console.log("Connected to Misty");
      getBattery();
      document.getElementById("success").innerHTML = message.success;
      console.log(data);
     });
   };

/* When a resident name is submitted, misty checks to see if that resident
 is in her file system. If the resident is in file system then get info 
 and display on screen. */
getResidentBtn.onclick = function () {
	// create new socket with ip and callback
	socket = new LightSocket(ip, mistyGetResident);
	ip = validateIPAddress(ipAddress.value);
		if (!ip) {
			console.log("You must connect to a robot first.");
			return;
		}
	socket.Connect();
}


/* Starts questionaire use case */
questionaire.onclick = function () {
	socket = new LightSocket(ip, startQuestionaire);
	ip = validateIPAddress(ipAddress.value);
	if (!ip) {
		console.log("You must connect to a robot first.");
		return;
  }   

	socket.Connect();
};

/* Starts the facial recognition use case */
facialRecognition.onclick = function () {
	socket = new LightSocket(ip, startFacialRecognition);
	ip = validateIPAddress(ipAddress.value);
		if (!ip) {
			console.log("You must connect to a robot first.");
			return;
		}
  socket.Connect();

};


/* Start prevention use case */
/* Starts questionaire use case */
sleepPrevention.onclick = function () {
	socket = new LightSocket(ip, startSleepPrevention);
	ip = validateIPAddress(ipAddress.value);
	if (!ip) {
		console.log("You must connect to a robot first.");
		return;
  }   
	socket.Connect();
};


/* Test stop button  */
stopSkills.onclick = function () {
	getCurrentRunningSkills();
};



/* 
 * Converts ip into a string that can be read 
 * This code snippet was used from Misty Robotics Sandbox code 
 * https://github.com/MistyCommunity/REST-API/blob/master/Sandbox/Find%20Face%20-%20Do%20Something/app.js
*/
function validateIPAddress(ip) {
	var ipNumbers = ip.split(".");
	var ipNums = new Array(4);
	if (ipNumbers.length !== 4) {
		return "";
	}
	for (let i = 0; i < 4; i++) {
		ipNums[i] = parseInt(ipNumbers[i]);
		if (ipNums[i] < 0 || ipNums[i] > 255) {
			return "";
		}
	}
	return ip;
};

