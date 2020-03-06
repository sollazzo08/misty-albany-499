import React from 'react'
import '../js/app';
import '../tools/lightClient';
import '../tools/lightSocket';


 class ConnectIP extends React.Component {
   



  render() {
    return (
      
      <div>
      <h3 className="">Connect to Robot: </h3>
      <input type="text" id="ip-address" placeholder="IP Address" required />
      <button type="button" id="connect">Connect</button>
    </div>

    )
  }
}


export default ConnectIP;