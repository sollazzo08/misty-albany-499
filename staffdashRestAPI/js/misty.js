const questionaireID = '22a75504-95b3-4e57-b0ba-bb476ffb4bce';
const facialRecognitionID = 'febce520-c85d-4a52-bf0a-48de02190f79';
const autismQuesitonaireID = '71224d1b-7e57-4b0b-b0d6-3f3d37bca45f';
const sleepPreventionID = '1cde7616-1f78-49e2-9cb1-de7827e98dee';

//Let misty pause to give her time to register and excute command

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


/*Take picture endpoint */
//GET http://192.168.1.151/api/cameras/rgb?base64=false&fileName=test_3&displayOnScreen=false&overwriteExisting=false
/*
function takePhoto(){
	var fileName = document.getElementById("takePhoto").value;
	
		axios.get('http://'+ ip +`/api/cameras/rgb?base64=false&fileName=&displayOnScreen=false&overwriteExisting=false`, {
			FileName: fileName,
			headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
		})
	.then(console.log("misty took a photo"))


	Promise.race([
		fetch('http://'+ ip + '/api/images?fileName=e_Admiration.jpg&base64=false', {
			method: 'GET'
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
	])
	.then(response => { return response.body.getReader().read().then((result) => { return result; }); })
	//In your code you can use this result to create a URL
	var blob = new Blob([result.value]);
	var url = window.URL.createObjectURL(blob);
	
	console.log(blob);
	console.log(url);

}
*/

//Now you can use this URL to set the source of your element
//You may also simply use this as a Url for the source field of an html element


/* Getting the startSkill() api and starting the questionaire skill. */
function startQuestionaire() {	
	var residentName = document.getElementById("residentSearch").value;
	$.ajax({
		method: 'GET',
		url: `http://localhost:1234/resident/?name=${residentName}`,
		dataType: 'json'
	}).done(function (data) {
		if(data[0].condition !== 'Autism'){

			axios.post(`http://` + ip + `/api/skills/start?skill=${questionaireID}`, {
					Skill: questionaireID
			})
				.then(response => (console.log(response)))
				.then(() => {
					console.log("Questionaire skill is starting...");
				})
				.catch(err => (console.log(err)))
		}
		else{
			console.log("PASS!");
			axios.post(`http://` + ip + `/api/skills/start?skill=${autismQuesitonaireID}`, {
				Skill: autismQuesitonaireID
			})
				.then(response => (console.log(response)))
				.then(() => {
					console.log("Autism questionaire is starting...");
				})
				.catch(err => (console.log(err)))
			}
		})
};

function startFacialRecognition() {
		axios.post(`http://` + ip + `/api/skills/start?skill=${facialRecognitionID}`, {
				Skill: facialRecognitionID
		})
			.then(response => (console.log(response)))
			.then(console.log("Facial Recognition is starting..."))
			.catch(err => (console.log(err)))
};

function startSleepPrevention(){
	axios.post(`http://` + ip + `/api/skills/start?skill=${sleepPreventionID}`, {
		Skill: sleepPreventionID
	})
	.then(response => (console.log(response)))
	.then(console.log("Sleep prevention is starting..."))
	.catch(err => (console.log(err)))
};

//gets list og all running skills by unique ID
function getCurrentRunningSkills(){	
	axios.get(`http://`+ ip + `/api/skills/running`, {
	})
		.then(console.log("Getting list of skills currently running..."))
		.then(function(response){
			let array = response.data.result;			//array of skill ID's of the currently running skills
			stopSkill(array);

		})
		.catch(err => (console.log(err)))

}

//stops all running skills
function stopSkill(uniqueIDArray){
	//looops through array of skill Id's and cancel each skill
	for(var i = 0; i < uniqueIDArray.length; i++){
			axios.post(`http://`+ ip + `/api/skills/cancel?/skill=${uniqueIDArray[i].startupArguments.skill}`, {
					Skill: uniqueIDArray[i].startupArguments.skill
			})
				.then(response => (console.log(response)))
				.then(console.log("Stopping SKill"))
				.catch(err => (console.log(err)))
				
		}
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
			
			//POST http://192.168.1.151/api/audio/play
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
				// Use Axios to issue a POST commandd to the 
				// endpoint for the StopFaceRecognition command.
				axios.post("http://" + ip + "/api/faces/recognition/stop");
			} 
			if(data.message.personName == "unknown person" && data.message.personName == null && data.message.personName == undefined){

				Promise.race([
					fetch('http://192.168.1.151/api/audio/play?fileName=face.wav', {
						method: 'POST',
						body: '{ "fileName":"face.wav","volume":null }'
					}),
					new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
				])
				.then(response => response.json())
				.then(jsonData => console.log(jsonData))
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
		console.log(data);	
	});
}

function getBattery(){

		axios.get('http://'+ ip + '/api/battery')
		.then(function(response){
			$('#battery').append('<h3>'+ response.data.result.chargePercent * (100) + '%' +'<h3>')
		})
		. catch(err => console.log(err)
	)
	
}


function stopTest2() {
	client.PostCommand("faces/detection/stop");
	console.log("Stopping Test");
	
  socket.close();
  messageCount = 0;
}



// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/


	
	var bar = new ProgressBar.Circle(container, {
		color: '#aaa',
		// This has to be the same size as the maximum width to
		// prevent clipping
		strokeWidth: 4,
		trailWidth: 1,
		easing: 'easeInOut',
		duration: 25000,
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

	

		



