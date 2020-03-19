//Helper functions
//Let misty pause to give her time to register and excute command
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


var ipAddress = document.getElementById('ip');
var connect = document.getElementById('connect');
var testStartSkill = document.getElementById('testStartSkill');
var testStopSkill= document.getElementById('testStopSkill');
var ip;
//This Ip never gets recorded 


const you = "Mike";
let onList = false;


connect.onclick = function() {
	ip = validateIPAddress(ipAddress.value);
	console.log("IP entered: " + ip);
	
  if (!ip) {
		console.log("IP address needed");
    return;
	}
	console.log("trying to connnect to misty..");
	
	client = new LightClient(ip, 10000);
  client.GetCommand("device", function(data) {
    console.log("Connected to Misty");
		console.log(data);
		
  });
};



//Test start funciton 
testStartSkill.onclick = function() {
	socket = new LightSocket(ip, startTest);
	ip = validateIPAddress(ipAddress.value);	
  if (!ip) {
    console.log("You must connect to a robot first.");
    return;
	}
	//console.log(ip);
	startTest();
	socket.Connect();
};

testStopSkill.onclick = function() {
  stopTest();
};


 async function startTest() {

		socket.Unsubscribe('FaceRecognition');
		await sleep(3000);
	
		axios.get("http://" + ip + "/api/faces")
			.then(function (res) {
				let faceArr = res.data.result;
				console.log("Learned faces: ", faceArr);
	
					for(let i = 0; i < faceArr.length; i++){
						if(faceArr[i] === you){
							onList = true;
						}
					}
	
					socket.Subscribe("FaceRecognition", "FaceRecognition", 200, null, null, null, null, _FaceRecognition);   
					console.log("subscribing to FaceRecognition");
					
					if(onList) {
						console.log('You were found on the list!');
							startFaceRecognition();
					} else {
						console.log('You were not on the list');
							startFaceTraining();
					}
	
			});
	}


function stopTest() {
	client.PostCommand("faces/detection/stop");
	console.log("Stopping Test");
	
  socket.close();
  messageCount = 0;
}


function startFaceRecognition() {
  console.log("starting Test..");   
    axios.post("http://" + ip + "/api/faces/recognition/start");
};

async function startFaceTraining() {
  console.log("starting face training");
    axios.post("http://" + ip + "/api/faces/training/start", { FaceId: "Robin" });
    await sleep(20000);
  
    console.log("face training complete");
    axios.post("http://" + ip + "/api/faces/recognition/start");
};

function _FaceRecognition(data, lightClient) {
  try {
      if (data.message.personName !== "unknown person" && data.message.personName !== null && data.message.personName !== undefined) {
          // If the face is recognized, print a 
          // message to greet the person by name.
      
          console.log(`A face was recognized. Hello there ${data.message.personName}!`);
					//POST http://192.168.1.151/api/tts/speak
					
					var person = data.message.personName;
					console.log(person);
					
				Promise.race([
					fetch(`http://`+ ip + `/api/tts/speak?text=Hello ${person}&flush=false`, {
						method: 'POST',
						body: `{ "text":"Hello ${person}","flush":false,"utteranceId":null }`
					}),
					new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
				])
				.then(response => response.json())
				.then(jsonData => console.log(jsonData))
         


          // Unsubscribe from the FaceRecognition WebSocket.
          socket.Unsubscribe("FaceRecognition");
          // Use Axios to issue a POST command to the 
          // endpoint for the StopFaceRecognition command.
          axios.post("http://" + ip + "/api/faces/recognition/stop");
      }
  }
  catch (e) {
      console.log("Error: " + e);
  }
}








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


