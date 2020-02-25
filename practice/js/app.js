var ipAddress = document.getElementById("ip-address");

connect.onclick = function(){
  ip = ipAddress;
  var client = new LightClient(ipAddress, 10000);
  client.GetCommand("device", function(data){
      console.log("Connected to Misty");
      console.log(data);
    
  });
};


