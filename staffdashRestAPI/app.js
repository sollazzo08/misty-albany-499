
var ipAddress = document.getElementById('ip');
var connect = document.getElementById('connect');
var ip;
var socket;
var client;

connect.onclick = function() {
  ip = validateIPAddress(ipAddress.value);
  if (!ip) {
    alert
    return;
  }
  client = new LightClient(ip, 10000);
  client.GetCommand("device", function(data) {
    
    console.log(data);
  });
};


//Helper function 
//Let misty pause to give her time to register and excute command
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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