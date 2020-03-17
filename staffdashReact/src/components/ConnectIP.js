import React from 'react'

 class ConnectIP extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ip: null
    };
  }
  myChangeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({[nam]: val});
  }
  render() {

    return (
      
      <form>
      <h1>Connect to Misty</h1>
      <p>Enter IP:</p>
      <input
        type='text'
        name='age'
        onChange={this.myChangeHandler}
      />
      </form>

    )
  }
}


export default ConnectIP;