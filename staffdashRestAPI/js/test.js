//Let misty pause to give her time to register and excute command
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var ipAddress = document.getElementById('ip');
var connect = document.getElementById('connect');
var testStartSkill = document.getElementById('testStartSkill');
var testStopSkill = document.getElementById('testStopSkill');
var questionaire = document.getElementById('questionaire');
var residentSearch = document.getElementById('residentSearch');
var facialRecognition = document.getElementById('facialRecognition');
var getResidentBtn = document.getElementById('getResidentBtn');
var ip;




/*
Connects to Misty on click
*/
connect.onclick = function() {
	ip = validateIPAddress(ipAddress.value);
	console.log("IP entered: " + ip);
  	if (!ip) {
			console.log("IP address needed");
    return;
	}
	console.log("Trying to connnect to misty..");
	client = new LightClient(ip, 10000);
  	client.GetCommand("device", function(data) {
  	console.log("Connected to Misty");
	console.log(data);	
  });
};


/*
Misty gets resident informaiton upon facial regcognition 
*/
getResidentBtn.onclick = function(){
	
	socket = new LightSocket(ip,mistyGetResident);
	ip = validateIPAddress(ipAddress.value);	
	if (!ip) {
		console.log("You must connect to a robot first.");
	return;
}
	//	mistyGetResident(residentName);
		socket.Connect();
}
		

testStartSkill.onclick = function() {
	socket = new LightSocket(ip, startTest);
	ip = validateIPAddress(ipAddress.value);	
  	if (!ip) {
    	console.log("You must connect to a robot first.");
    return;
	}
	//console.log(ip);
	//startTest();
	socket.Connect();
};

/* Clicking this would start the questionaire skill. */
questionaire.onclick = function() {
	socket = new LightSocket(ip, startTest);
	ip = validateIPAddress(ipAddress.value);	
  	if (!ip) {
    	console.log("You must connect to a robot first.");
    return;
		}
	goToQuestionaire();
	socket.Connect();
};


/* Clicking this would start the facial recognition skill. */
facialRecognition.onclick = function() {
	socket = new LightSocket(ip, startTest);
	ip = validateIPAddress(ipAddress.value);	
  	if (!ip) {
    	console.log("You must connect to a robot first.");
    return;
	}
	
	goToFacialRecognition();
	socket.Connect();
}

testStopSkill.onclick = function() {
  stopTest();
};

 async function startTest() {
	 //Sleep for 5 seconds to give Misty time ~ time may need to be adjusted
		await sleep(5000);

 	
        Promise.race([
					fetch('http://'+ ip + '/api/skills/start?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
						method: 'POST',
						body: '{ "skill":"d83d7a01-f53e-47d8-a96e-0ba7b49d77ad","method":null }'
					}),
					new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
				])
				.then(response => response.json())
				.then(jsonData => console.log(jsonData))
	}

/* Misty skill stop endpoint 
	 Make sure to have correct skill id string
*/
function stopTest() {
	Promise.race([
		fetch('http://'+ ip +'/api/skills/cancel?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
			method: 'POST',
			body: '{ "skill":"d83d7a01-f53e-47d8-a96e-0ba7b49d77ad" }'
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
	])
	.then(response => response.json())
	.then(jsonData => console.log(jsonData))
	.then(console.log("Skill has stopped!")
	)
}


/* Gives Misty time to rest and process. */
async function goToQuestionaire() {
	//Sleep for 5 seconds
	await sleep(5000);
	startQuestionaire();
}

/* Gives Misty time to rest and process. */
async function goToFacialRecognition() {
	//Sleep for 5 seconds
	await sleep(5000);
	startFacialRecognition();
}

/* Getting the startSkill() api and starting the questionaire skill. */
function startQuestionaire(){
	Promise.race([
		fetch('http://'+ ip + '/api/skills/start?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
		  method: 'POST',
		  body: '{ "skill":"d83d7a01-f53e-47d8-a96e-0ba7b49d77ad","method":null }'
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
	  	])
	  	.then(response => response.json())
		.then(jsonData => console.log(jsonData))
		.then(console.log("Questionaire is starting...")
		)
};

function startFacialRecognition(){
	Promise.race([
		fetch('http://'+ ip + '/api/skills/start?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
		  method: 'POST',
		  body: '{ "skill":"febce520-c85d-4a52-bf0a-48de02190f79","method":null }'
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
	  	])
	  	.then(response => response.json())
		.then(jsonData => console.log(jsonData))
		.then(console.log("Facial Recognition is starting...")
		)
};


/*******************************************************Everything under here is for Get Resident Button********************************************************************************/

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

async function mistyGetResident(){
	let onList = false;
	var residentName = document.getElementById("residentSearch").value;
	console.log(residentName);

	socket.Unsubscribe('FaceRecognition');
	await sleep(3000);
		
		axios.get("http://" + ip + "/api/faces")
			.then(function (res) {
				let faceArr = res.data.result;
				console.log("Learned faces: ", faceArr);
	
					for(let i = 0; i < faceArr.length; i++){
						if(faceArr[i] === residentName){
							console.log('Misty found'+ residentName);							
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

async function _FaceRecognition(data) {
	
  try {
      if (data.message.personName !== "unknown person" && data.message.personName !== null && data.message.personName !== undefined) {
          // If the face is recognized, print a 
					// message to greet the person by name.
					
				//	await sleep(5000);
					console.log('test');
					
          await getInfo(data.message.personName);
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

function getInfo(namee){
	$.ajax({
		method:'GET',
		url: `http://localhost:1234/resident/?name=${namee}`,
		dataType: 'json'
	}).done(function(data){
		console.log(data[0]);
		//$.map(data, function(post, i){
			$('#result').append('<h3>'+ data[0].name +'</h3> <p>'+'Age: ' + data[0].age +'</p>'
			 +'<p>'+'Location: ' + data[0].location +'</p>'
			+ '<p>'+'Condition: ' + data[0].condition +'</p>'
);

	});
}

/*
function stopTest2() {
	client.PostCommand("faces/detection/stop");
	console.log("Stopping Test");
	
  socket.close();
  messageCount = 0;
}
*/

/* Converts ip into a string that can be read */
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