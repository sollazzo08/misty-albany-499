//Let misty pause to give her time to register and excute command
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
/*
async function startTest() {
	//Sleep for 5 seconds to give Misty time ~ time may need to be adjusted
	await sleep(5000);

	Promise.race([
			fetch('http://' + ip + '/api/skills/start?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
				method: 'POST',
				body: '{ "skill":"d83d7a01-f53e-47d8-a96e-0ba7b49d77ad","method":null }'
			}),
			new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
		])
		.then(response => response.json())
		.then(jsonData => console.log(jsonData))
}
*/

/* Misty skill stop endpoint 
	 Make sure to have correct skill id string

function stopTest() {
	Promise.race([
			fetch('http://' + ip + '/api/skills/cancel?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
				method: 'POST',
				body: '{ "skill":"d83d7a01-f53e-47d8-a96e-0ba7b49d77ad" }'
			}),
			new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
		])
		.then(response => response.json())
		.then(jsonData => console.log(jsonData))
		.then(console.log("Skill has stopped!"))
}
*/
/*Take picture endpoint */
//GET http://192.168.1.151/api/cameras/rgb?base64=false&fileName=test_3&displayOnScreen=false&overwriteExisting=false
function takePhoto(){
	var fileName = document.getElementById("takePhoto").value;
	
	Promise.race([
	
		fetch('http://'+ ip +`/api/cameras/rgb?base64=false&fileName=&displayOnScreen=false&overwriteExisting=false`, {
			method: 'GET',
			FileName: "testy",
			headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
	])
	.then(response => response.json())
	.then(jsonData => console.log(jsonData))

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
function startQuestionaire() {												// d83d7a01-f53e-47d8-a96e-0ba7b49d77ad ~ capture speech
	Promise.race([																			// baca7c34-3133-4b27-a5f4-dc1aa4855b3b ~ questionaire 
																											// 22a75504-95b3-4e57-b0ba-bb476ffb4bce ~ questionaire-2
																										
			fetch('http://' + ip + '/api/skills/start?skill=22a75504-95b3-4e57-b0ba-bb476ffb4bce', {
				method: 'POST',
				body: '{ "skill":"22a75504-95b3-4e57-b0ba-bb476ffb4bce","method":null }'
			}),
			new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
		])
		.then(response => response.json())
		.then(jsonData => console.log(jsonData))
		.then(console.log("Questionaire is starting..."))
};

function startFacialRecognition() {
	Promise.race([
			fetch('http://' + ip + '/api/skills/start?skill=d83d7a01-f53e-47d8-a96e-0ba7b49d77ad', {
				method: 'POST',
				body: '{ "skill":"febce520-c85d-4a52-bf0a-48de02190f79","method":null }'
			}),
			new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
		])
		.then(response => response.json())
		.then(jsonData => console.log(jsonData))
		.then(console.log("Facial Recognition is starting..."))
};


/*******************************************************Everything under here is for Get Resident Button********************************************************************************/

function startFaceRecognition() {
	console.log("starting Test..");
	axios.post("http://" + ip + "/api/faces/recognition/start");
};

async function startFaceTraining() {
	console.log("starting face training");
	var residentName = document.getElementById("residentSearch").value;
	axios.post("http://" + ip + "/api/faces/training/start", {

		FaceId: residentName
	});
	await sleep(20000);

	console.log("face training complete");
	axios.post("http://" + ip + "/api/faces/recognition/start");
};

async function mistyGetResident() {
	let onList = false;
	var residentName = document.getElementById("residentSearch").value;
	//console.log(residentName);
	socket.Unsubscribe('FaceRecognition');
	await sleep(3000);

	axios.get("http://" + ip + "/api/faces")
		.then(function (res) {
			let faceArr = res.data.result;
			console.log("Learned faces: ", faceArr);

			for (let i = 0; i < faceArr.length; i++) {
				if (faceArr[i] === residentName) {
					console.log('Misty found' + residentName);
					onList = true;
				}
			}

			socket.Subscribe("FaceRecognition", "FaceRecognition", 200, null, null, null, null, _FaceRecognition);
			console.log("subscribing to FaceRecognition");

			if (onList) {
				console.log('You were found on the list!');
				startFaceRecognition();
			} else {
				console.log('You were not on the list');		
				bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
				bar.text.style.fontSize = '2rem';
				bar.animate(1.0);  // Number from 0.0 to 1.0
				startFaceTraining();
			}
		});
}

/*Checks if face is in the Misty database.  */
async function _FaceRecognition(data) {

	var person = data.message.personName;

	try {
		if (data.message.personName !== "unknown person" && data.message.personName !== null && data.message.personName !== undefined) {
			//await sleep(5000);
			await getInfo(data.message.personName);
			console.log(`A face was recognized. Hello there ${data.message.personName}!`);
			
			Promise.race([
					fetch(`http://` + ip + `/api/tts/speak?text=Hello ${person}&flush=false`, {
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
	} catch (e) {
		console.log("Error: " + e);
	}
}

/*Gets resident info from the database, appends info to html */
function getInfo(residentName) {
	$.ajax({
		method: 'GET',
		url: `http://localhost:1234/resident/?name=${residentName}`,
		dataType: 'json'
	}).done(function (data) {

		$('#result').append('<h3>' + data[0].name + '</h3> <p>' + 'Age: ' + data[0].age + '</p>' +
			'<p>' + 'Location: ' + data[0].location + '</p>' +
			'<p>' + 'Condition: ' + data[0].condition + '</p>'
		);

	});
}

function getBattery(){
	Promise.race([
		fetch('http://'+ ip + '/api/battery', {
			method: 'GET'
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
	])
	.then(response => response.json())
	//.then(jsonData => console.log(jsonData.result.chargePercent))
	.then(jsonData => {
		var batteryLevel = jsonData.result.chargePercent;
		console.log(batteryLevel);
		$('#battery').append('<h3>'+ batteryLevel * (100) + '%' +'<h3>');
	})
}

/*
function stopTest2() {
	client.PostCommand("faces/detection/stop");
	console.log("Stopping Test");
	
  socket.close();
  messageCount = 0;
}
*/


// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/


	
	var bar = new ProgressBar.Circle(container, {
		color: '#aaa',
		// This has to be the same size as the maximum width to
		// prevent clipping
		strokeWidth: 4,
		trailWidth: 1,
		easing: 'easeInOut',
		duration: 24000,
		text: {
			autoStyleContainer: false
		},
		from: { color: '#aaa', width: 1 },
		to: { color: '#5bc0de', width: 4 },
		// Set default step function for all animate calls
		step: function(state, circle) {		
			circle.path.setAttribute('stroke', state.color);
			circle.path.setAttribute('stroke-width', state.width);
			
			var value = Math.round(circle.value() * 100);
			if (value === 0) {
				circle.setText('');
			} else {
				circle.setText(value);
			}			
		}
		
	});

	

		



