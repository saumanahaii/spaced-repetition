import React, { Component } from 'react';
import './App.css';
import Login from './components/login';
import Body from './components/body';
import './css/css.css';
import './css/scanlines.css';

class App extends Component {
  render() {
    return (
      <div className="App">

        <div className="header">
          <h1>Emojinal</h1>
          <Login />
        </div>
        <Body />
      </div>
    );
  }
}

export default App;
