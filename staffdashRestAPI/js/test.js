//Let misty pause to give her time to register and excute command
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var ipAddress = document.getElementById('ip');
var connect = document.getElementById('connect');
var testStartSkill = document.getElementById('testStartSkill');
var testStopSkill= document.getElementById('testStopSkill');
var questionaire= document.getElementById('questionaire');
var facialRecognition = document.getElementById('facialRecognition');
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
	 //Sleep for 5 seconds to give Misty time ~ time may need to be adjusted
    await sleep(5000);
          startSkill();
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

/* Misty start skill endpoint
	 Make sure to have correct skill id string
*/
function startSkill() {
  Promise.race([
    fetch('http://'+ ip + '/api/skills/start?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
      method: 'POST',
      body: '{ "skill":"d83d7a01-f53e-47d8-a96e-0ba7b49d77ad","method":null }'
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
  ])
  .then(response => response.json())
	.then(jsonData => console.log(jsonData))
	.then(console.log("Skill is starting...")
	)
    
};

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

/* Clicking this would start the questionaire skill. */
questionaire.onclick = function() {
	socket = new LightSocket(ip, startTest);
	ip = validateIPAddress(ipAddress.value);	
  	if (!ip) {
    	console.log("You must connect to a robot first.");
    return;
	}
	//console.log(ip);
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
	//console.log(ip);
	goToFacialRecognition();
	socket.Connect();
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

