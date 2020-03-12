

//Helper function 
//Let misty pause to give her time to register and excute command
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



//var ip  = document.getElementById("ip-address");
//var connect = document.getElementById("connect");
//var start = document.getElementById("start");
//var stop = document.getElementById("stop");
var ip ="192.168.100.105";


//Turn this into a form in browser where uses can type and send their names
const you = "Mike";

let onList = false;

let socket = new LightSocket(ip, openCallback);


//THis unsubscribes from any existing FaceRecognition ws connections

async function openCallback(){
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

        if(onList) {
          console.log('You were found on the list!');
            startFaceRecognition();
        } else {
          console.log('You were not on the list');
            startFaceTraining();
        }

    });
}

function startFaceRecognition() {
  console.log("starting face recognition");   
    axios.post("http://" + ip + "/api/faces/recognition/start");
};

async function startFaceTraining() {
  console.log("starting face training");
    axios.post("http://" + ip + "/api/faces/training/start", { FaceId: you });
    await sleep(20000);
  
    console.log("face training complete");
    axios.post("http://" + ip + "/api/faces/recognition/start");
};


function _FaceRecognition(data) {
  try {
      if (data.message.personName !== "unknown person" && data.message.personName !== null && data.message.personName !== undefined) {
          // If the face is recognized, print a 
          // message to greet the person by name.
          console.log(`A face was recognized. Hello there ${data.message.personName}!`);
       
         


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

socket.Connect();