var ipAddress = document.getElementById('ip');
var connect = document.getElementById('connect');
var testStartSkill = document.getElementById('testStartSkill');
var testStopSkill = document.getElementById('testStopSkill');
var questionaire = document.getElementById('questionaire');
var residentSearch = document.getElementById('residentSearch');
var facialRecognition = document.getElementById('facialRecognition');
var getResidentBtn = document.getElementById('getResidentBtn');
var submitResident = document.getElementById('submit_resident');
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
	socket = new LightSocket(ip, startTest);
	ip = validateIPAddress(ipAddress.value);
		if (!ip) {
			console.log("You must connect to a robot first.");
			return;
		}
	goToFacialRecognition();
	socket.Connect();
}

/* Test button */
testStartSkill.onclick = function () {
	socket = new LightSocket(ip, startTest);
	ip = validateIPAddress(ipAddress.value);
		if (!ip) {
			console.log("You must connect to a robot first.");
			return;
		}
	socket.Connect();
};

/* Test stop button */
testStopSkill.onclick = function () {
	stopTest();
};

/*S3 bucket image upload */
$(document).ready(function () { 
	$(".custom-file-input").on("change", function() {
	var file = $(this).val().split("\\").pop();
	const selectedFile = document.getElementById('res_img').files[0];
 	console.log(selectedFile);
 	console.log(selectedFile.name);
  
  let fileParts = selectedFile.name.split('.');
  console.log(fileParts);
	
  let fileName = fileParts[0];
	let fileType = fileParts[1];

	console.log("Preparing the upload");
	
	axios.post("http://localhost:1234/sign_s3",{
    fileName : fileName,
    fileType : fileType
  })
  .then(response => {
    var returnData = response.data.data.returnData;
    console.log(returnData);
    
    var signedRequest = returnData.signedRequest;
    console.log(signedRequest);
    
    var url = returnData.url;
    console.log(url);
    
    console.log("Recieved a signed request " + signedRequest);
    /*
      http://localhost:9000/image
      http://ec2-3-17-26-49.us-east-2.compute.amazonaws.com:9000/image
    */
    axios.post("http://localhost:1234/image", {                      
      url: url
    }).then(() => console.log("Sent url to db"))
      .catch((err) => console.log(err));
   // Put the fileType in the headers for the upload
    var options = {
      headers: {
        'Content-Type': fileType
      }
    };
    axios.put(signedRequest,file,options)
    .then(result => {
      console.log("Response from s3")
      console.log(options);
      
      
    })
    .catch(error => {
      alert("ERROR " + JSON.stringify(error));
    })
  })
  .catch(error => {
    alert(JSON.stringify(error));
  })
})
});


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

