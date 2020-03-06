function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function Wander() {
  ip = $("#misty-robot-ip-address").val();

  //Create client for commanding
  var lightClient = new LightClient(ip, 10000);

  //Create socket for listening to sensors
  lightSocket = new LightSocket(ip);
  lightSocket.Connect();

  //Wait for connection
  await sleep(5000);

  //Subscribe to WorldState to get objects and store them
  lightSocket.Subscribe("Objects", "WorldState", 200, null, null, null, "Objects", function (data) { $('#ObjectList').val(data); });

  //Wait for data
  await sleep(2000);

  //Take the first step
  wanderStep(lightClient, lightSocket);
}

async function wanderStep(lightClient, lightSocket) {
  if (document.getElementById('StopWander').checked == true) {
    //Cleanup
    document.getElementById('StopWander').checked = false;
    lightClient.PostCommand("drive/stop");
    lightSocket.Unsubscribe("Objects");
    return;
  }

  //Wander pass 1 - Drive straight, but when you see an obstacle, turn away from it.
  //NOTE: This implementation tends to get stuck in corners
  lin = 50;
  ang = 0;
  ms = 2000;
  mindist = 0.75;
  var objectArray = $('#ObjectList').val();
  for (var i = 0; i < objectArray.message.length; i++) {
    wobj = objectArray.message[i];
    if (wobj.location != null) {
      bearing = wobj.location.bearing;
      distance = wobj.location.distance;
      if (bearing > -Math.PI / 4 && bearing < Math.PI / 4 && distance < mindist && wobj.isSensible == true) {
        mindist = distance;
        ang = -Math.sign(bearing) * 50;
        lin = 0;
        ms = 500;
      }
    }
  }

  //The callback will trigger when driveTime finishes (or is terminated by collision avoidance), and cause the next step.  Recursion FTW!
  lightClient.PostCommand("drive/time", " {\"LinearVelocity\":" + lin + ",\"AngularVelocity\":" + ang + ", \"TimeMs\":" + ms + "}", function () { wanderStep(lightClient, lightSocket); });
}